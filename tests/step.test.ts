import { describe, expect, it } from 'vitest';
import { index3D } from '../src/sim/grid';
import { createState, total } from '../src/sim/state';
import { defaultStepParams, stepReference } from '../src/sim/step';

describe('v0 conserved field reference model', () => {
  it('conserves total matter across repeated steps', () => {
    let state = createState({ x: 8, y: 8, z: 8 });
    state.resource.fill(1);
    state.matter[index3D(4, 4, 4, state.size)] = 1;
    state.matter[index3D(3, 4, 4, state.size)] = 0.5;
    const initial = total(state.matter);

    for (let i = 0; i < 50; i += 1) state = stepReference(state);

    expect(total(state.matter)).toBeCloseTo(initial, 4);
    expect(Math.min(...state.matter)).toBeGreaterThanOrEqual(0);
  });

  it('keeps matter inside the world through periodic boundaries', () => {
    let state = createState({ x: 4, y: 4, z: 4 });
    state.resource.fill(1);
    state.matter[index3D(0, 0, 0, state.size)] = 1;

    state = stepReference(state, {
      ...defaultStepParams,
      resourceCoupling: 0,
    });

    expect(state.matter[index3D(3, 0, 0, state.size)]).toBeGreaterThan(0);
    expect(state.matter[index3D(0, 3, 0, state.size)]).toBeGreaterThan(0);
    expect(state.matter[index3D(0, 0, 3, state.size)]).toBeGreaterThan(0);
  });

  it('supports a z=1 low-dimensional reference fixture with the same rule', () => {
    let state = createState({ x: 8, y: 8, z: 1 });
    state.resource.fill(1);
    state.matter[index3D(4, 4, 0, state.size)] = 1;
    const initial = total(state.matter);

    for (let i = 0; i < 25; i += 1) state = stepReference(state);

    expect(total(state.matter)).toBeCloseTo(initial, 4);
    expect(state.matter.every(Number.isFinite)).toBe(true);
  });

  it('allows an open resource channel without changing matter conservation', () => {
    let state = createState({ x: 6, y: 6, z: 6 });
    state.resource.fill(0.5);
    state.matter[index3D(3, 3, 3, state.size)] = 1;
    const matterBefore = total(state.matter);
    const resourceBefore = total(state.resource);

    for (let i = 0; i < 20; i += 1) state = stepReference(state);

    expect(total(state.matter)).toBeCloseTo(matterBefore, 4);
    expect(total(state.resource)).not.toBeCloseTo(resourceBefore, 4);
  });
});
