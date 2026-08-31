import { describe, expect, it } from 'vitest';
import { index3D } from '../src/sim/grid';
import { createState, total } from '../src/sim/state';
import {
  computeAffinityField,
  defaultStepParams,
  resourceExperimentStepParams,
  stepReference,
} from '../src/sim/step';

describe('v0 conserved affinity-flow reference model', () => {
  it('conserves total matter and stays non-negative across repeated steps', () => {
    let state = createState({ x: 8, y: 8, z: 8 });
    state.resource.fill(1);
    state.matter[index3D(4, 4, 4, state.size)] = 1;
    state.matter[index3D(3, 4, 4, state.size)] = 0.5;
    const initial = total(state.matter);

    for (let i = 0; i < 50; i += 1) state = stepReference(state);

    expect(total(state.matter)).toBeCloseTo(initial, 4);
    expect(state.matter.every((value) => Number.isFinite(value) && value >= 0)).toBe(true);
  });

  it('moves matter locally through periodic boundaries', () => {
    let state = createState({ x: 4, y: 4, z: 4 });
    state.resource.fill(1);
    state.matter[index3D(0, 0, 0, state.size)] = 1;

    state = stepReference(state);

    expect(state.matter[index3D(3, 0, 0, state.size)]).toBeGreaterThan(0);
    expect(state.matter[index3D(0, 3, 0, state.size)]).toBeGreaterThan(0);
    expect(state.matter[index3D(0, 0, 3, state.size)]).toBeGreaterThan(0);
  });

  it('supports a z=1 low-dimensional fixture with the same implementation', () => {
    let state = createState({ x: 8, y: 8, z: 1 });
    state.resource.fill(1);
    state.matter[index3D(4, 4, 0, state.size)] = 1;
    const initial = total(state.matter);

    for (let i = 0; i < 25; i += 1) state = stepReference(state);

    expect(total(state.matter)).toBeCloseTo(initial, 4);
    expect(state.matter.every(Number.isFinite)).toBe(true);
  });

  it('is axis-symmetric for a centered point seed', () => {
    const state = createState({ x: 9, y: 9, z: 9 });
    state.resource.fill(1);
    state.matter[index3D(4, 4, 4, state.size)] = 1;

    const affinity = computeAffinityField(state);
    expect(affinity[index3D(5, 4, 4, state.size)]).toBeCloseTo(
      affinity[index3D(4, 5, 4, state.size)],
      6,
    );
    expect(affinity[index3D(5, 4, 4, state.size)]).toBeCloseTo(
      affinity[index3D(4, 4, 5, state.size)],
      6,
    );

    const next = stepReference(state);
    const neighbors = [
      next.matter[index3D(3, 4, 4, state.size)],
      next.matter[index3D(5, 4, 4, state.size)],
      next.matter[index3D(4, 3, 4, state.size)],
      next.matter[index3D(4, 5, 4, state.size)],
      next.matter[index3D(4, 4, 3, state.size)],
      next.matter[index3D(4, 4, 5, state.size)],
    ];
    for (const value of neighbors.slice(1)) expect(value).toBeCloseTo(neighbors[0], 6);
  });

  it('does not let a distant perturbation alter a local one-step neighborhood', () => {
    const a = createState({ x: 12, y: 12, z: 12 });
    const b = createState({ x: 12, y: 12, z: 12 });
    a.resource.fill(1);
    b.resource.fill(1);
    const center = index3D(6, 6, 6, a.size);
    a.matter[center] = 0.5;
    b.matter[center] = 0.5;
    b.matter[index3D(0, 0, 0, b.size)] = 0.7;

    const nextA = stepReference(a);
    const nextB = stepReference(b);
    const localCoordinates = [
      [6, 6, 6],
      [5, 6, 6], [7, 6, 6],
      [6, 5, 6], [6, 7, 6],
      [6, 6, 5], [6, 6, 7],
    ] as const;

    for (const [x, y, z] of localCoordinates) {
      const i = index3D(x, y, z, a.size);
      expect(nextB.matter[i]).toBeCloseTo(nextA.matter[i], 7);
    }
  });

  it('keeps the baseline M dynamics independent of resource values', () => {
    const uniform = createState({ x: 8, y: 8, z: 8 });
    const varied = createState({ x: 8, y: 8, z: 8 });
    uniform.resource.fill(1);
    varied.resource.fill(0.2);
    const center = index3D(4, 4, 4, uniform.size);
    uniform.matter[center] = 1;
    varied.matter[center] = 1;

    const nextUniform = stepReference(uniform, defaultStepParams);
    const nextVaried = stepReference(varied, defaultStepParams);

    expect(Array.from(nextVaried.matter)).toEqual(Array.from(nextUniform.matter));
  });

  it('allows controlled resource coupling without changing matter conservation', () => {
    let state = createState({ x: 6, y: 6, z: 6 });
    for (let z = 0; z < state.size.z; z += 1) {
      for (let y = 0; y < state.size.y; y += 1) {
        for (let x = 0; x < state.size.x; x += 1) {
          state.resource[index3D(x, y, z, state.size)] = 0.4 + 0.6 * x / (state.size.x - 1);
        }
      }
    }
    state.matter[index3D(3, 3, 3, state.size)] = 1;
    const matterBefore = total(state.matter);
    const resourceBefore = total(state.resource);

    for (let i = 0; i < 20; i += 1) state = stepReference(state, resourceExperimentStepParams);

    expect(total(state.matter)).toBeCloseTo(matterBefore, 4);
    expect(total(state.resource)).not.toBeCloseTo(resourceBefore, 4);
    expect(state.matter.every((value) => Number.isFinite(value) && value >= 0)).toBe(true);
  });
});
