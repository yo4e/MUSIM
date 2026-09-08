import { describe, expect, it } from 'vitest';
import { attenuateMatter, removeMatterNearPeak } from '../src/experiment/perturbation';
import { index3D } from '../src/sim/grid';
import { createState, total } from '../src/sim/state';

describe('experiment perturbations', () => {
  it('removes a periodic local sphere around the peak matter voxel', () => {
    const state = createState({ x: 5, y: 5, z: 5 });
    state.matter[index3D(0, 0, 0, state.size)] = 2;
    state.matter[index3D(4, 0, 0, state.size)] = 1;
    state.matter[index3D(2, 2, 2, state.size)] = 0.5;

    const result = removeMatterNearPeak(state, 1);

    expect(result.center).toEqual({ x: 0, y: 0, z: 0 });
    expect(result.removedMatter).toBeCloseTo(3, 6);
    expect(result.fractionRemoved).toBeCloseTo(3 / 3.5, 6);
    expect(state.matter[index3D(4, 0, 0, state.size)]).toBe(0);
    expect(state.matter[index3D(2, 2, 2, state.size)]).toBeCloseTo(0.5, 6);
  });

  it('applies a spatially uniform mass-matched attenuation control', () => {
    const state = createState({ x: 2, y: 2, z: 2 });
    state.matter[0] = 2;
    state.matter[1] = 1;

    attenuateMatter(state, 0.75);

    expect(total(state.matter)).toBeCloseTo(2.25, 6);
    expect(state.matter[0]).toBeCloseTo(1.5, 6);
    expect(state.matter[1]).toBeCloseTo(0.75, 6);
  });
});
