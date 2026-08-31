import { volume, type GridSize } from './grid';

export type SimState = {
  readonly size: GridSize;
  readonly matter: Float32Array;
  readonly resource: Float32Array;
  readonly catalyst: Float32Array;
};

export function createState(size: GridSize): SimState {
  const n = volume(size);
  return {
    size,
    matter: new Float32Array(n),
    resource: new Float32Array(n),
    catalyst: new Float32Array(n),
  };
}

export function cloneState(state: SimState): SimState {
  return {
    size: state.size,
    matter: state.matter.slice(),
    resource: state.resource.slice(),
    catalyst: state.catalyst.slice(),
  };
}

export function total(channel: Float32Array): number {
  let sum = 0;
  for (const value of channel) sum += value;
  return sum;
}
