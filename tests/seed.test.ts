import { describe, expect, it } from 'vitest';
import { createSeededState } from '../src/sim/seed';

describe('seed fixtures', () => {
  it('is deterministic for the same noise seed', () => {
    const a = createSeededState({ x: 8, y: 8, z: 8 }, 'noise', 42);
    const b = createSeededState({ x: 8, y: 8, z: 8 }, 'noise', 42);

    expect(Array.from(a.matter)).toEqual(Array.from(b.matter));
    expect(Array.from(a.resource)).toEqual(Array.from(b.resource));
  });

  it('uses a uniform resource field by default', () => {
    const state = createSeededState({ x: 8, y: 8, z: 8 }, 'single', 1);
    expect(state.resource.every((value) => value === 1)).toBe(true);
  });

  it('only adds the x resource gradient when explicitly requested', () => {
    const state = createSeededState(
      { x: 8, y: 8, z: 8 },
      'single',
      1,
      { resourceProfile: 'gradient-x' },
    );
    expect(state.resource[0]).toBeCloseTo(0.4, 6);
    expect(state.resource[7]).toBeCloseTo(1, 6);
  });
});
