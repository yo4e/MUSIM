import { wrappedIndex3D } from './grid';
import { createState, type SimState } from './state';

export type StepParams = Readonly<{
  matterDiffusion: number;
  resourceDiffusion: number;
  resourceRecovery: number;
  resourceCapacity: number;
  resourceCoupling: number;
  catalystGain: number;
  catalystDecay: number;
}>;

export const defaultStepParams: StepParams = {
  matterDiffusion: 0.08,
  resourceDiffusion: 0.12,
  resourceRecovery: 0.004,
  resourceCapacity: 1,
  resourceCoupling: 0.02,
  catalystGain: 0.015,
  catalystDecay: 0.01,
};

const AXIAL_NEIGHBORS = [
  [-1, 0, 0], [1, 0, 0],
  [0, -1, 0], [0, 1, 0],
  [0, 0, -1], [0, 0, 1],
] as const;

/**
 * CPU reference step for the v0 substrate.
 *
 * Matter M is transported only by pairwise fluxes, so its global sum is
 * conserved up to floating-point roundoff. Resource R is deliberately open:
 * it diffuses, recovers toward a capacity, and is depleted by local matter.
 * Catalyst C is an optional internal-state proxy driven by M/R overlap.
 *
 * This is a reference model and test oracle for the future WebGPU kernel, not
 * a claim that the rule itself is Flow-Lenia. Flow-Lenia motivates conserved
 * transport and localized state; MUSIM's R/C channels are project-specific.
 */
export function stepReference(state: SimState, params: StepParams = defaultStepParams): SimState {
  const next = createState(state.size);
  next.matter.set(state.matter);
  next.resource.set(state.resource);
  next.catalyst.set(state.catalyst);

  const { x: sx, y: sy, z: sz } = state.size;

  // Conservative M transport. Each undirected edge is visited once (+x,+y,+z)
  // and equal/opposite flux is applied to its endpoints.
  const positiveNeighbors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as const;
  for (let z = 0; z < sz; z += 1) {
    for (let y = 0; y < sy; y += 1) {
      for (let x = 0; x < sx; x += 1) {
        const i = wrappedIndex3D(x, y, z, state.size);
        for (const [dx, dy, dz] of positiveNeighbors) {
          const j = wrappedIndex3D(x + dx, y + dy, z + dz, state.size);
          const gradient = state.matter[j] - state.matter[i];
          const resourceBias = Math.tanh(state.resource[j] - state.resource[i]);
          const catalystMobility = 1 + 0.25 * Math.tanh(state.catalyst[i]);
          const flux = params.matterDiffusion * catalystMobility * gradient
            + params.resourceCoupling * resourceBias * Math.min(state.matter[i], state.matter[j] + 0.01);
          next.matter[i] += flux;
          next.matter[j] -= flux;
        }
      }
    }
  }

  // Clamp tiny numerical negatives without manufacturing mass: collect any
  // deficit, then subtract it proportionally from positive cells.
  let deficit = 0;
  let positiveMass = 0;
  for (let i = 0; i < next.matter.length; i += 1) {
    if (next.matter[i] < 0) {
      deficit += -next.matter[i];
      next.matter[i] = 0;
    } else {
      positiveMass += next.matter[i];
    }
  }
  if (deficit > 0 && positiveMass > deficit) {
    const scale = (positiveMass - deficit) / positiveMass;
    for (let i = 0; i < next.matter.length; i += 1) next.matter[i] *= scale;
  }

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
        const consumption = params.resourceCoupling * state.matter[i] * state.resource[i];
        next.resource[i] = Math.max(0, state.resource[i] + params.resourceDiffusion * laplacian + recovery - consumption);

        const overlap = state.matter[i] * state.resource[i];
        next.catalyst[i] = Math.max(0, state.catalyst[i]
          + params.catalystGain * overlap
          - params.catalystDecay * state.catalyst[i]);
      }
    }
  }

  return next;
}
