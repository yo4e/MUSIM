# CPU calibration checkpoint — 2026-09-08

This note records the first quantitative follow-up to Issue #3 after the affinity-driven CPU scientific reference was merged.

The purpose is deliberately narrow: determine whether the current `M`-only dynamics preserve localized states across more than one initial condition / nearby parameter setting, then compare the controlled resource-coupled condition against matched `M`-only controls. This is **not** evidence of life, agency, metabolism, or open-ended evolution.

## Measurement

The existing `occupiedCells` metric is useful but depends on an arbitrary observation threshold. This calibration therefore adds two threshold-independent matter-shape metrics:

- `effectiveVolume = (sum(M) ** 2) / sum(M ** 2)`
- `peakMatter = max(M)`

`effectiveVolume` is the inverse-participation-style effective number of occupied voxels. Lower values mean that a fixed amount of matter is concentrated into fewer voxels; higher values mean a more spatially diffuse state.

These metrics do not define an individual and do not add IDs or segmentation to the simulation ontology.

## Protocol

- grid: `32 x 32 x 32`, periodic
- CPU rule: current `stepReference()`
- observation horizon for this checkpoint: 200 ticks
- `M`-only baseline: uniform `R`, no `R -> M` feedback, `C` disabled
- localized seeds: `single`, `double`
- distributed seed: `noise`, numeric seeds 1, 2, 3
- local parameter neighborhood for `single`:
  - `affinityTarget`: default 0.04, then -20% (0.032), +20% (0.048)
  - `affinityWidth`: default 0.025, then -20% (0.020), +20% (0.030)
- controlled resource comparison:
  - same localized initial matter seeds
  - `gradient-x` resource profile
  - `resourceExperimentStepParams`

The exploratory measurements were first run with a temporary Node runner preserving the same `Float32Array` state representation and update order as the current TypeScript reference. This branch adds `npm run experiment:cpu` as the canonical repeatable path for subsequent runs.

## M-only baseline

At tick 200:

| seed | matter | occupied cells | effective volume | peak matter |
| --- | ---: | ---: | ---: | ---: |
| single | 2.910053 | 52 | 29.559 | 0.124710 |
| double | 5.836347 | 90 | 54.095 | 0.151871 |
| noise / seed 1 | 38.844985 | 17,292 | 7,884.018 | 0.033347 |
| noise / seed 2 | 38.362151 | 17,381 | 8,441.514 | 0.018102 |
| noise / seed 3 | 39.449418 | 17,399 | 8,278.103 | 0.021279 |

Initial effective volumes were approximately 52.87 for `single` and 106.24 for `double`. Both localized seeds therefore become **more concentrated**, not less, over this 200-tick window while preserving total matter within floating-point tolerance.

The three random-noise seeds behave differently: they spread into a broad field with effective volumes around 8,000 and more than 17,000 voxels above the current occupancy threshold. No spontaneous localized candidate was observed from these noise seeds in this checkpoint.

### Interpretation

The current reference rule now has a genuine localized-state regime for seeded blobs over the observed horizon. That is stronger than the earlier diffusion-dominated smoke test.

However, the result is seed-dependent in an important sense. A localized initial blob persists/concentrates, while random low-density initial conditions do not currently self-organize into comparable localized objects. The present evidence therefore supports **persistence of supplied localization**, not robust spontaneous emergence of individuality.

## Parameter neighborhood

For the `single` seed at tick 200:

| parameter setting | occupied cells | effective volume | peak matter |
| --- | ---: | ---: | ---: |
| default | 52 | 29.559 | 0.124710 |
| `affinityTarget` -20% | 61 | 34.916 | 0.109192 |
| `affinityTarget` +20% | 52 | 28.349 | 0.129446 |
| `affinityWidth` -20% | 40 | 26.064 | 0.136505 |
| `affinityWidth` +20% | 61 | 33.471 | 0.114257 |

Localization survives all four nearby settings tested here. The width/target changes alter how compact the blob becomes, but none of these small perturbations causes the localized seed to dissolve over 200 ticks.

This is an encouraging local robustness result, but it is still a small neighborhood around one parameterization and one localized seed shape. It should not be generalized to the whole parameter space.

## Controlled resource comparison

At tick 200:

| seed | condition | effective volume | peak matter | centroid x | resource total |
| --- | --- | ---: | ---: | ---: | ---: |
| single | M-only | 29.559 | 0.124710 | 13.389 | 32,768.000 |
| single | resource-coupled | 29.765 | 0.123808 | 13.685 | 28,354.399 |
| double | M-only | 54.095 | 0.151871 | 16.000 | 32,768.000 |
| double | resource-coupled | 49.470 | 0.163992 | 16.166 | 28,350.554 |

The resource condition measurably changes the localized dynamics and consumes/replenishes the open `R` field, but the effect at this checkpoint is modest. The x-centroid shifts toward the high-resource side by roughly 0.30 voxel for `single` and 0.17 voxel for `double` relative to matched controls.

That difference is **not sufficient to call the behavior resource-seeking**. A stronger claim would require repeated seeds/parameter settings, gradient reversal, resource cutoff/recovery, longer runs, and matched controls.

## Current conclusion

The CPU reference has crossed an important calibration threshold:

1. seeded localized states can persist and become more concentrated for at least 200 ticks;
2. that localization survives a small neighborhood of affinity target/width settings;
3. random-noise seeds do not yet show comparable spontaneous localization;
4. controlled resource coupling changes the dynamics without replacing the local field rule with an explicit seek command;
5. the observed resource effect is currently too small and too lightly sampled for behavioral language.

WebGPU should therefore remain blocked. The next scientifically useful step is not rendering performance; it is a longer-horizon and perturbation study of the localized candidates.

## Next experiment

Before WebGPU:

- extend `single` / `double` runs well beyond 200 ticks to test lifetime / steady behavior;
- repeat the most promising parameter neighborhood across more localized perturbations;
- locally remove matter from a long-lived blob and measure recovery or failure;
- compare resource gradient reversal and resource cutoff against matched `M`-only controls;
- only activate `C` if those experiments expose a concrete missing state variable.

The repeatable sweep command added with this checkpoint is:

```bash
npm run experiment:cpu
```

It prints CSV rows at ticks 0, 50, 100, and 200 for the canonical baseline, noise-seed, nearby-parameter, and resource-control cases above.
