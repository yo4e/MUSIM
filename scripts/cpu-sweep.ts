import {
  createSeededState,
  type ResourceProfile,
  type SeedKind,
} from '../src/sim/seed';
import { measure } from '../src/sim/metrics';
import {
  defaultStepParams,
  resourceExperimentStepParams,
  stepReference,
  type StepParams,
} from '../src/sim/step';

type Trial = Readonly<{
  label: string;
  mode: 'M-only' | 'resource';
  kind: SeedKind;
  seed: number;
  resourceProfile: ResourceProfile;
  params: StepParams;
}>;

const size = { x: 32, y: 32, z: 32 } as const;
const finalTick = 200;
const checkpoints = new Set([0, 50, 100, 200]);

const parameterNeighborhood: readonly Trial[] = [
  {
    label: 'single / target -20%',
    mode: 'M-only',
    kind: 'single',
    seed: 1,
    resourceProfile: 'uniform',
    params: { ...defaultStepParams, affinityTarget: 0.032 },
  },
  {
    label: 'single / target +20%',
    mode: 'M-only',
    kind: 'single',
    seed: 1,
    resourceProfile: 'uniform',
    params: { ...defaultStepParams, affinityTarget: 0.048 },
  },
  {
    label: 'single / width -20%',
    mode: 'M-only',
    kind: 'single',
    seed: 1,
    resourceProfile: 'uniform',
    params: { ...defaultStepParams, affinityWidth: 0.020 },
  },
  {
    label: 'single / width +20%',
    mode: 'M-only',
    kind: 'single',
    seed: 1,
    resourceProfile: 'uniform',
    params: { ...defaultStepParams, affinityWidth: 0.030 },
  },
];

const trials: readonly Trial[] = [
  {
    label: 'single / default',
    mode: 'M-only',
    kind: 'single',
    seed: 1,
    resourceProfile: 'uniform',
    params: defaultStepParams,
  },
  {
    label: 'double / default',
    mode: 'M-only',
    kind: 'double',
    seed: 1,
    resourceProfile: 'uniform',
    params: defaultStepParams,
  },
  ...[1, 2, 3].map((seed): Trial => ({
    label: `noise / default / seed ${seed}`,
    mode: 'M-only',
    kind: 'noise',
    seed,
    resourceProfile: 'uniform',
    params: defaultStepParams,
  })),
  ...parameterNeighborhood,
  {
    label: 'single / resource matched condition',
    mode: 'resource',
    kind: 'single',
    seed: 1,
    resourceProfile: 'gradient-x',
    params: resourceExperimentStepParams,
  },
  {
    label: 'double / resource matched condition',
    mode: 'resource',
    kind: 'double',
    seed: 1,
    resourceProfile: 'gradient-x',
    params: resourceExperimentStepParams,
  },
];

console.log([
  'label',
  'mode',
  'kind',
  'seed',
  'tick',
  'matter',
  'occupied_cells',
  'effective_volume',
  'peak_matter',
  'centroid_x',
  'centroid_y',
  'centroid_z',
  'resource',
].join(','));

for (const trial of trials) {
  let state = createSeededState(size, trial.kind, trial.seed, {
    resourceProfile: trial.resourceProfile,
  });

  for (let tick = 0; tick <= finalTick; tick += 1) {
    if (checkpoints.has(tick)) {
      const result = measure(state);
      console.log([
        JSON.stringify(trial.label),
        trial.mode,
        trial.kind,
        trial.seed,
        tick,
        result.matterTotal.toFixed(9),
        result.occupiedCells,
        result.effectiveVolume.toFixed(6),
        result.peakMatter.toFixed(9),
        result.centroid.x.toFixed(6),
        result.centroid.y.toFixed(6),
        result.centroid.z.toFixed(6),
        result.resourceTotal.toFixed(6),
      ].join(','));
    }

    if (tick < finalTick) {
      state = stepReference(state, trial.params);
    }
  }
}
