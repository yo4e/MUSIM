import { index3D } from './grid';
import { createState, type SimState } from './state';

export type SeedKind = 'single' | 'double' | 'noise';

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function addBlob(state: SimState, cx: number, cy: number, cz: number, radius: number, amount: number): void {
  for (let z = 0; z < state.size.z; z += 1) {
    for (let y = 0; y < state.size.y; y += 1) {
      for (let x = 0; x < state.size.x; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        const dz = z - cz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= radius * radius) {
          const weight = Math.exp(-d2 / Math.max(1, radius * radius * 0.5));
          state.matter[index3D(x, y, z, state.size)] += amount * weight;
        }
      }
    }
  }
}

export function createSeededState(size = { x: 32, y: 32, z: 32 }, kind: SeedKind = 'single', seed = 1): SimState {
  const state = createState(size);
  state.resource.fill(1);
  const rng = mulberry32(seed);

  if (kind === 'single' || kind === 'double') {
    addBlob(state, size.x * 0.42, size.y * 0.5, size.z * 0.5, Math.max(2, size.x * 0.08), 0.12);
  }
  if (kind === 'double') {
    addBlob(state, size.x * 0.58, size.y * 0.5, size.z * 0.5, Math.max(2, size.x * 0.08), 0.12);
  }
  if (kind === 'noise') {
    for (let i = 0; i < state.matter.length; i += 1) {
      state.matter[i] = rng() < 0.03 ? rng() * 0.08 : 0;
    }
  }

  // Small deterministic resource gradient for resource-coupling experiments.
  for (let z = 0; z < size.z; z += 1) {
    for (let y = 0; y < size.y; y += 1) {
      for (let x = 0; x < size.x; x += 1) {
        const i = index3D(x, y, z, size);
        state.resource[i] = 0.4 + 0.6 * (x / Math.max(1, size.x - 1));
      }
    }
  }

  return state;
}
