import { index3D } from './grid';
import { total, type SimState } from './state';

export type SimMetrics = Readonly<{
  matterTotal: number;
  resourceTotal: number;
  catalystTotal: number;
  centroid: Readonly<{ x: number; y: number; z: number }>;
  occupiedCells: number;
}>;

function periodicMean(
  weightedSin: number,
  weightedCos: number,
  arithmeticWeighted: number,
  totalWeight: number,
  period: number,
): number {
  if (period <= 1 || totalWeight <= 0) return 0;
  const magnitude = Math.hypot(weightedSin, weightedCos);
  if (magnitude < 1e-12) return arithmeticWeighted / totalWeight;
  let angle = Math.atan2(weightedSin, weightedCos);
  if (angle < 0) angle += 2 * Math.PI;
  return period * angle / (2 * Math.PI);
}

export function measure(state: SimState, threshold = 1e-4): SimMetrics {
  const matterTotal = total(state.matter);
  let arithmeticX = 0;
  let arithmeticY = 0;
  let arithmeticZ = 0;
  let sinX = 0;
  let cosX = 0;
  let sinY = 0;
  let cosY = 0;
  let sinZ = 0;
  let cosZ = 0;
  let occupiedCells = 0;

  for (let z = 0; z < state.size.z; z += 1) {
    for (let y = 0; y < state.size.y; y += 1) {
      for (let x = 0; x < state.size.x; x += 1) {
        const m = state.matter[index3D(x, y, z, state.size)];
        if (m > threshold) occupiedCells += 1;
        arithmeticX += x * m;
        arithmeticY += y * m;
        arithmeticZ += z * m;

        if (m > 0) {
          const angleX = 2 * Math.PI * x / Math.max(1, state.size.x);
          const angleY = 2 * Math.PI * y / Math.max(1, state.size.y);
          const angleZ = 2 * Math.PI * z / Math.max(1, state.size.z);
          sinX += Math.sin(angleX) * m;
          cosX += Math.cos(angleX) * m;
          sinY += Math.sin(angleY) * m;
          cosY += Math.cos(angleY) * m;
          sinZ += Math.sin(angleZ) * m;
          cosZ += Math.cos(angleZ) * m;
        }
      }
    }
  }

  return {
    matterTotal,
    resourceTotal: total(state.resource),
    catalystTotal: total(state.catalyst),
    centroid: {
      x: periodicMean(sinX, cosX, arithmeticX, matterTotal, state.size.x),
      y: periodicMean(sinY, cosY, arithmeticY, matterTotal, state.size.y),
      z: periodicMean(sinZ, cosZ, arithmeticZ, matterTotal, state.size.z),
    },
    occupiedCells,
  };
}
