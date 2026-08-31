import { wrappedIndex3D } from './grid';
import { createState, type SimState } from './state';

export type StepParams = Readonly<{
  kernelRadius: number;
  kernelShellRadius: number;
  kernelShellWidth: number;
  affinityTarget: number;
  affinityWidth: number;
  affinityGain: number;
  pressureGain: number;
  maxTransportFraction: number;
  resourceDiffusion: number;
  resourceRecovery: number;
  resourceCapacity: number;
  resourceConsumption: number;
  resourceInfluence: number;
  catalystGain: number;
  catalystDecay: number;
  catalystInfluence: number;
}>;

/**
 * Baseline parameters deliberately keep R/C from feeding back into M.
 * Resource/catalyst coupling is enabled only in explicit experiment presets.
 */
export const defaultStepParams: StepParams = {
  kernelRadius: 3,
  kernelShellRadius: 2,
  kernelShellWidth: 0.65,
  affinityTarget: 0.04,
  affinityWidth: 0.025,
  affinityGain: 0.8,
  pressureGain: 1.5,
  maxTransportFraction: 0.18,
  resourceDiffusion: 0.08,
  resourceRecovery: 0,
  resourceCapacity: 1,
  resourceConsumption: 0,
  resourceInfluence: 0,
  catalystGain: 0,
  catalystDecay: 0.01,
  catalystInfluence: 0,
};

/**
 * Controlled resource-coupled preset. R changes the local preferred density
 * used by the affinity response; it is not injected as a direct movement
 * command or a hard-coded "seek resource" vector.
 */
export const resourceExperimentStepParams: StepParams = {
  ...defaultStepParams,
  resourceRecovery: 0.004,
  resourceConsumption: 0.012,
  resourceInfluence: 0.35,
};

const AXIAL_NEIGHBORS = [
  [-1, 0, 0], [1, 0, 0],
  [0, -1, 0], [0, 1, 0],
  [0, 0, -1], [0, 0, 1],
] as const;

type KernelOffset = Readonly<{
  dx: number;
  dy: number;
  dz: number;
  weight: number;
}>;

const kernelCache = new Map<string, readonly KernelOffset[]>();

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function kernelOffsets(params: StepParams): readonly KernelOffset[] {
  const radius = Math.max(1, Math.round(params.kernelRadius));
  const shellWidth = Math.max(1e-6, params.kernelShellWidth);
  const key = `${radius}:${params.kernelShellRadius}:${shellWidth}`;
  const cached = kernelCache.get(key);
  if (cached) return cached;

  const raw: Array<{ dx: number; dy: number; dz: number; weight: number }> = [];
  let weightSum = 0;
  for (let dz = -radius; dz <= radius; dz += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance > radius) continue;
        const q = (distance - params.kernelShellRadius) / shellWidth;
        const weight = Math.exp(-0.5 * q * q);
        if (weight < 1e-6) continue;
        raw.push({ dx, dy, dz, weight });
        weightSum += weight;
      }
    }
  }

  const normalized = raw.map(({ dx, dy, dz, weight }) => ({
    dx,
    dy,
    dz,
    weight: weight / Math.max(weightSum, 1e-12),
  }));
  kernelCache.set(key, normalized);
  return normalized;
}

/**
 * Compute a Lenia-style local affinity map from an isotropic shell convolution
 * followed by a smooth target-density response.
 *
 * This is Flow-Lenia-inspired rather than a literal Flow-Lenia implementation:
 * the published model uses Lenia affinity together with reintegration tracking.
 * MUSIM keeps the same high-level structure (affinity -> flow -> conserved
 * redistribution) while using an inspectable local voxel transport rule as the
 * CPU scientific reference for the 3D experiment.
 */
export function computeAffinityField(
  state: SimState,
  params: StepParams = defaultStepParams,
): Float32Array {
  const offsets = kernelOffsets(params);
  const affinity = new Float32Array(state.matter.length);
  const { x: sx, y: sy, z: sz } = state.size;

  for (let z = 0; z < sz; z += 1) {
    for (let y = 0; y < sy; y += 1) {
      for (let x = 0; x < sx; x += 1) {
        const i = wrappedIndex3D(x, y, z, state.size);
        let localDensity = 0;
        for (const { dx, dy, dz, weight } of offsets) {
          const j = wrappedIndex3D(x + dx, y + dy, z + dz, state.size);
          localDensity += weight * state.matter[j];
        }

        const resourceNorm = params.resourceCapacity > 0
          ? clamp(state.resource[i] / params.resourceCapacity, 0, 2)
          : 1;
        const target = Math.max(
          1e-6,
          params.affinityTarget * (1 + params.resourceInfluence * (1 - resourceNorm)),
        );
        const width = Math.max(1e-6, params.affinityWidth);
        const q = (localDensity - target) / width;
        const densityAffinity = 2 * Math.exp(-0.5 * q * q) - 1;
        const catalystBias = params.catalystInfluence * Math.tanh(state.catalyst[i]);
        affinity[i] = densityAffinity + catalystBias;
      }
    }
  }

  return affinity;
}

function transportWeight(
  state: SimState,
  affinity: Float32Array,
  i: number,
  j: number,
  params: StepParams,
): number {
  // Positive drive means matter at i prefers to move toward j. Both terms are
  // antisymmetric under i<->j, so traversal direction cannot change the rule.
  const affinityDrive = params.affinityGain * (affinity[j] - affinity[i]);
  const concentrationPressure = params.pressureGain * (state.matter[i] - state.matter[j]);
  return Math.max(0, Math.tanh(affinityDrive + concentrationPressure));
}

/**
 * CPU scientific-reference step for MUSIM v0.
 *
 * Flow-Lenia motivates the structure: a local affinity field defines a flow,
 * while a concentration-pressure term prevents unconstrained collapse and the
 * transport conserves matter. This implementation is deliberately simpler than
 * published reintegration tracking and must be described as Flow-Lenia-inspired.
 *
 * Every cell computes all six outgoing transport weights from the *old* state.
 * Its total outgoing budget is bounded by a fraction of its old matter. Transfers
 * are then applied pairwise, so M stays local, non-negative, and globally
 * conserved without a world-wide post-step rescaling.
 */
export function stepReference(state: SimState, params: StepParams = defaultStepParams): SimState {
  const next = createState(state.size);
  next.matter.set(state.matter);
  next.resource.set(state.resource);
  next.catalyst.set(state.catalyst);

  const { x: sx, y: sy, z: sz } = state.size;
  const affinity = computeAffinityField(state, params);
  const outgoingWeight = new Float32Array(state.matter.length);

  // Pass 1: calculate each source cell's total desired outgoing flow from the
  // unchanged state. This makes the result independent of traversal order.
  for (let z = 0; z < sz; z += 1) {
    for (let y = 0; y < sy; y += 1) {
      for (let x = 0; x < sx; x += 1) {
        const i = wrappedIndex3D(x, y, z, state.size);
        let sum = 0;
        for (const [dx, dy, dz] of AXIAL_NEIGHBORS) {
          const j = wrappedIndex3D(x + dx, y + dy, z + dz, state.size);
          sum += transportWeight(state, affinity, i, j, params);
        }
        outgoingWeight[i] = sum;
      }
    }
  }

  // Pass 2: spend at most maxTransportFraction of each source cell's old mass.
  // Each directed transfer subtracts and adds the same amount locally.
  const transportFraction = clamp(params.maxTransportFraction, 0, 1);
  for (let z = 0; z < sz; z += 1) {
    for (let y = 0; y < sy; y += 1) {
      for (let x = 0; x < sx; x += 1) {
        const i = wrappedIndex3D(x, y, z, state.size);
        const sourceMass = state.matter[i];
        if (sourceMass <= 0 || outgoingWeight[i] <= 0) continue;
        const scale = sourceMass * transportFraction / Math.max(1, outgoingWeight[i]);

        for (const [dx, dy, dz] of AXIAL_NEIGHBORS) {
          const j = wrappedIndex3D(x + dx, y + dy, z + dz, state.size);
          const weight = transportWeight(state, affinity, i, j, params);
          if (weight <= 0) continue;
          const transfer = scale * weight;
          next.matter[i] -= transfer;
          next.matter[j] += transfer;
        }
      }
    }
  }

  // R is an open environmental channel. The default baseline has no consumption
  // or recovery and therefore does not feed back into M. Explicit experiment
  // presets can turn these terms on.
  for (let z = 0; z < sz; z += 1) {
    for (let y = 0; y < sy; y += 1) {
      for (let x = 0; x < sx; x += 1) {
        const i = wrappedIndex3D(x, y, z, state.size);
        let neighborResource = 0;
        for (const [dx, dy, dz] of AXIAL_NEIGHBORS) {
          neighborResource += state.resource[wrappedIndex3D(x + dx, y + dy, z + dz, state.size)];
        }
        const laplacian = neighborResource / AXIAL_NEIGHBORS.length - state.resource[i];
        const recovery = params.resourceRecovery * (params.resourceCapacity - state.resource[i]);
        const consumption = params.resourceConsumption * state.matter[i] * state.resource[i];
        next.resource[i] = Math.max(
          0,
          state.resource[i] + params.resourceDiffusion * laplacian + recovery - consumption,
        );

        const overlap = state.matter[i] * state.resource[i];
        next.catalyst[i] = Math.max(
          0,
          state.catalyst[i]
            + params.catalystGain * overlap
            - params.catalystDecay * state.catalyst[i],
        );
      }
    }
  }

  return next;
}
