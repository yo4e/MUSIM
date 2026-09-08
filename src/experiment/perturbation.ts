import { index3D } from '../sim/grid';
import { total, type SimState } from '../sim/state';

export type VoxelPoint = Readonly<{ x: number; y: number; z: number }>;

export type MatterRemoval = Readonly<{
  center: VoxelPoint;
  removedMatter: number;
  fractionRemoved: number;
}>;

function periodicDelta(value: number, center: number, period: number): number {
  if (period <= 0) return value - center;
  let delta = value - center;
  if (delta > period / 2) delta -= period;
  if (delta < -period / 2) delta += period;
  return delta;
}

export function findPeakMatterVoxel(state: SimState): VoxelPoint {
  let peak = -Infinity;
  let point: VoxelPoint = { x: 0, y: 0, z: 0 };

  for (let z = 0; z < state.size.z; z += 1) {
    for (let y = 0; y < state.size.y; y += 1) {
      for (let x = 0; x < state.size.x; x += 1) {
        const matter = state.matter[index3D(x, y, z, state.size)];
        if (matter > peak) {
          peak = matter;
          point = { x, y, z };
        }
      }
    }
  }

  return point;
}

/**
 * Experiment-only perturbation: remove matter from a periodic sphere centered
 * on the current peak-matter voxel. This mutates the supplied state but does
 * not add any repair rule, individual ID, or agent-side semantics.
 */
export function removeMatterNearPeak(state: SimState, radius = 1): MatterRemoval {
  const center = findPeakMatterVoxel(state);
  const before = total(state.matter);
  const radiusSquared = Math.max(0, radius) ** 2;
  let removedMatter = 0;

  for (let z = 0; z < state.size.z; z += 1) {
    for (let y = 0; y < state.size.y; y += 1) {
      for (let x = 0; x < state.size.x; x += 1) {
        const dx = periodicDelta(x, center.x, state.size.x);
        const dy = periodicDelta(y, center.y, state.size.y);
        const dz = periodicDelta(z, center.z, state.size.z);
        if (dx * dx + dy * dy + dz * dz > radiusSquared) continue;

        const i = index3D(x, y, z, state.size);
        removedMatter += state.matter[i];
        state.matter[i] = 0;
      }
    }
  }

  return {
    center,
    removedMatter,
    fractionRemoved: before > 0 ? removedMatter / before : 0,
  };
}

/** Apply a mass-matched control without changing the spatial shape directly. */
export function attenuateMatter(state: SimState, keepFraction: number): void {
  const factor = Math.min(1, Math.max(0, keepFraction));
  for (let i = 0; i < state.matter.length; i += 1) {
    state.matter[i] *= factor;
  }
}
