import { describe, expect, it } from 'vitest';
import { index3D } from '../src/sim/grid';
import { measure } from '../src/sim/metrics';
import { createState } from '../src/sim/state';

describe('observer metrics', () => {
  it('treats opposite periodic edges as spatial neighbors for centroid measurement', () => {
    const state = createState({ x: 4, y: 4, z: 4 });
    state.matter[index3D(0, 0, 0, state.size)] = 1;
    state.matter[index3D(3, 0, 0, state.size)] = 1;

    const result = measure(state);

    // The boundary-safe center lies halfway between x=3 and wrapped x=0.
    expect(result.centroid.x).toBeCloseTo(3.5, 6);
    expect(result.centroid.y).toBeCloseTo(0, 6);
    expect(result.centroid.z).toBeCloseTo(0, 6);
  });
});
