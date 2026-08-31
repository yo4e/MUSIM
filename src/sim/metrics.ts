import { index3D } from './grid';
import { total, type SimState } from './state';

export type SimMetrics = Readonly<{
  matterTotal: number;
  resourceTotal: number;
  catalystTotal: number;
  centroid: Readonly<{ x: number; y: number; z: number }>;
  occupiedCells: number;
}>;

export function measure(state: SimState, threshold = 1e-4): SimMetrics {
  const matterTotal = total(state.matter);
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;
  let occupiedCells = 0;

  for (let z = 0; z < state.size.z; z += 1) {
    for (let y = 0; y < state.size.y; y += 1) {
      for (let x = 0; x < state.size.x; x += 1) {
        const m = state.matter[index3D(x, y, z, state.size)];
        if (m > threshold) occupiedCells += 1;
        weightedX += x * m;
        weightedY += y * m;
        weightedZ += z * m;
      }
    }
  }

  const denom = matterTotal || 1;
  return {
    matterTotal,
    resourceTotal: total(state.resource),
    catalystTotal: total(state.catalyst),
    centroid: {
      x: weightedX / denom,
      y: weightedY / denom,
      z: weightedZ / denom,
    },
    occupiedCells,
  };
}
