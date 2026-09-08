import { attenuateMatter, removeMatterNearPeak } from '../src/experiment/perturbation';
import { measure } from '../src/sim/metrics';
import { createSeededState, type SeedKind } from '../src/sim/seed';
import { cloneState, type SimState } from '../src/sim/state';
import { defaultStepParams, stepReference } from '../src/sim/step';

type Condition = 'control' | 'local-damage' | 'mass-matched';

const size = { x: 32, y: 32, z: 32 } as const;
const settleTick = 500;
const damageRadius = 1;

function printRow(
  kind: SeedKind,
  condition: Condition,
  tick: number,
  removedFraction: number,
  state: SimState,
): void {
  const result = measure(state);
  console.log([
    kind,
    condition,
    tick,
    removedFraction.toFixed(9),
    result.matterTotal.toFixed(9),
    result.effectiveVolume.toFixed(6),
    result.peakMatter.toFixed(9),
    result.occupiedCells,
    result.centroid.x.toFixed(6),
    result.centroid.y.toFixed(6),
    result.centroid.z.toFixed(6),
  ].join(','));
}

function settle(kind: SeedKind): SimState {
  let state = createSeededState(size, kind, 1, { resourceProfile: 'uniform' });
  for (let tick = 0; tick < settleTick; tick += 1) {
    state = stepReference(state, defaultStepParams);
  }
  return state;
}

function continueCondition(
  kind: SeedKind,
  condition: Condition,
  initial: SimState,
  removedFraction: number,
  finalTick: number,
): void {
  let state = initial;
  const checkpoints = new Set([
    settleTick,
    settleTick + 1,
    550,
    600,
    750,
    1000,
    ...(finalTick >= 1500 ? [1500] : []),
    ...(finalTick >= 2000 ? [2000] : []),
  ]);

  for (let tick = settleTick; tick <= finalTick; tick += 1) {
    if (checkpoints.has(tick)) {
      printRow(kind, condition, tick, removedFraction, state);
    }
    if (tick < finalTick) {
      state = stepReference(state, defaultStepParams);
    }
  }
}

console.log([
  'kind',
  'condition',
  'tick',
  'removed_fraction',
  'matter',
  'effective_volume',
  'peak_matter',
  'occupied_cells',
  'centroid_x',
  'centroid_y',
  'centroid_z',
].join(','));

for (const kind of ['single', 'double'] as const) {
  const settled = settle(kind);
  const control = cloneState(settled);
  const damaged = cloneState(settled);
  const matched = cloneState(settled);

  const removal = removeMatterNearPeak(damaged, damageRadius);
  const keepFraction = 1 - removal.fractionRemoved;
  attenuateMatter(matched, keepFraction);

  // Single is followed to 1000 ticks. Double receives an additional 2000-tick
  // extension because its two-lobe state relaxes more slowly after asymmetry.
  const finalTick = kind === 'double' ? 2000 : 1000;

  continueCondition(kind, 'control', control, 0, finalTick);
  continueCondition(kind, 'local-damage', damaged, removal.fractionRemoved, finalTick);
  continueCondition(kind, 'mass-matched', matched, removal.fractionRemoved, finalTick);
}
