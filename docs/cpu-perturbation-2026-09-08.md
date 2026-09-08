# CPU long-horizon / perturbation checkpoint — 2026-09-08

This note follows [`cpu-calibration-2026-09-08.md`](cpu-calibration-2026-09-08.md) and records the next CPU-only checkpoint for Issue #3.

The question is narrower than “does it repair itself?” The current `M` channel is conserved and has no matter-production mechanism, so removed matter cannot regenerate. The useful question is instead:

> after a localized state is allowed to settle, does a local spatial perturbation destroy localization, or does the remaining matter relax back toward the same kind of localized state?

A second control is required to interpret that result. If local damage removes mass, a damaged state must be compared not only with an untouched control but also with a **mass-matched control** that removes the same amount of matter uniformly without changing the shape directly.

## Protocol

- grid: `32 x 32 x 32`, periodic
- CPU rule: current `stepReference()` / default `M`-only parameters
- resource: uniform and uncoupled
- catalyst: disabled
- localized initial conditions: `single` and `double`
- settling time before perturbation: 500 ticks
- local perturbation: zero `M` inside a periodic sphere of radius 1 around the current peak-matter voxel
- matched attenuation: multiply every `M` voxel by the fraction required to leave the same total matter as the locally damaged state
- untouched control: continue the same 500-tick state without perturbation
- single: follow through tick 1000
- double: follow through tick 2000 because the asymmetric two-lobe condition relaxes more slowly

The perturbation is experiment-side tooling only. It does not add damage detection, repair instructions, creature IDs, boundaries, goals, or any other agent-side semantics to the simulation.

The repeatable repository command is:

```bash
npm run experiment:damage
```

It uses the canonical `stepReference()` implementation. Because the execution environment used for this checkpoint could not install the repository dependencies, the exploratory measurements below were generated with an experiment-only Node mirror that precomputes fixed neighbor/kernel indices but preserves the current `Float32Array` update representation and arithmetic order. The optimized mirror was checked against the canonical 32³ / 200-tick results from the preceding calibration and reproduced them to the recorded precision. PR CI remains the repository-side validation for tests, typecheck, and build.

## Untouched long-horizon controls

The localized states remain localized well beyond the earlier 200-tick checkpoint.

| seed | tick | matter | effective volume | peak matter | occupied cells |
| --- | ---: | ---: | ---: | ---: | ---: |
| single | 200 | 2.910053 | 29.559 | 0.124710 | 52 |
| single | 500 | 2.910053 | 28.319 | 0.124171 | 40 |
| single | 1000 | 2.910051 | 27.090 | 0.122724 | 33 |
| double | 200 | 5.836347 | 54.095 | 0.151871 | 90 |
| double | 500 | 5.836343 | 53.563 | 0.154710 | 80 |
| double | 1000 | 5.836355 | 53.523 | 0.154816 | 80 |
| double | 2000 | 5.836324 | 53.522 | 0.154818 | 80 |

The `single` state continues to compact slowly. The `double` state is effectively stationary in these scalar localization measures by roughly 500–1000 ticks.

This strengthens the earlier conclusion that the current CPU rule has a persistent localized-state regime for supplied localized initial conditions. It still does not show spontaneous individuality from random noise.

## Local removal and matched controls

At tick 500, the radius-1 peak-centered removal removes:

- `single`: 0.661350 matter, **22.73%** of the settled total;
- `double`: 0.640807 matter, **10.98%** of the settled total.

The matching uniform attenuation factors are therefore approximately 0.772736 and 0.890204 respectively.

The exact peak voxel is selected deterministically by grid traversal when values tie. This is an observation/perturbation convention, not an individual marker inside the world.

### Single

| condition | tick | matter | effective volume | peak matter | occupied cells | centroid |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| untouched | 1000 | 2.910051 | 27.090 | 0.122724 | 33 | (13.026, 16.000, 16.000) |
| local removal | 500, immediately after | 2.248703 | 22.363 | 0.124171 | 33 | (13.218, 16.000, 16.264) |
| local removal | 550 | 2.248703 | 29.075 | 0.099480 | 48 | (13.185, 16.000, 16.181) |
| local removal | 1000 | 2.248703 | 26.721 | 0.097247 | 35 | (13.032, 16.000, 16.030) |
| mass-matched attenuation | 500 | 2.248703 | 28.319 | 0.095951 | 40 | (13.177, 16.000, 16.000) |
| mass-matched attenuation | 1000 | 2.248702 | 26.497 | 0.096775 | 32 | (13.026, 16.000, 16.000) |

The local notch causes a large immediate shape change, but by tick 1000 the local-removal and mass-matched branches are close in effective volume and peak density. The damaged branch also returns near the control's spatial location, with only a small residual displacement.

The important interpretation is **not** “the blob repaired itself.” The mass-matched control reaches nearly the same scalar shape without having a local wound. Most of the apparent recovery is therefore consistent with ordinary relaxation toward a mass-dependent localized attractor.

### Double

At tick 1000:

| condition | matter | effective volume | peak matter | occupied cells | centroid |
| --- | ---: | ---: | ---: | ---: | --- |
| untouched | 5.836355 | 53.523 | 0.154816 | 80 | (16.000, 16.000, 16.000) |
| local removal | 5.195534 | 46.525 | 0.147355 | 66 | (16.226, 16.225, 16.225) |
| mass-matched attenuation | 5.195541 | 45.183 | 0.146322 | 81 | (16.000, 16.000, 16.000) |

The local and mass-matched shape measures are already in the same broad regime by tick 1000, but they are not yet as close as in `single`. The locally damaged state also acquires a clear displacement because the perturbation breaks the symmetric two-lobe configuration.

The extra extension to tick 2000 gives:

| condition | effective volume | peak matter | occupied cells | centroid |
| --- | ---: | ---: | ---: | --- |
| untouched | 53.522 | 0.154818 | 80 | (16.000, 16.000, 16.000) |
| local removal | 44.738 | 0.147739 | 57 | (16.371, 16.370, 16.370) |
| mass-matched attenuation | 45.141 | 0.146360 | 57 | (16.000, 16.000, 16.000) |

By tick 2000, the local-removal and mass-matched branches are very close in effective volume and occupancy. The main persistent difference is translation: the asymmetric local perturbation excites a positional mode, while uniform attenuation preserves the centered symmetry.

Again, this is more naturally described as **perturbation relaxation of a localized field state** than as repair behavior.

## Current interpretation

This checkpoint supports several stronger statements than the earlier 200-tick run, but it also rules out an over-strong interpretation.

1. **Long-lived localization:** supplied `single` and `double` localized states survive for at least 1000 ticks, and the `double` control remains stable through 2000 ticks in the measured localization statistics.
2. **Perturbation tolerance:** removing a localized portion of `M` does not cause immediate irreversible dispersal of the remaining matter in these trials.
3. **Shape relaxation:** after local removal, the remaining matter relaxes back toward a compact state.
4. **Mass dependence matters:** a uniform mass-matched attenuation reaches very similar long-run shape statistics, so the current evidence does not identify a special wound-response or repair mechanism.
5. **Asymmetry can produce motion:** the locally perturbed `double` state retains a translation relative to the symmetric matched control. In a periodic isotropic world, translation is a natural neutral mode and is not evidence of goal-directed motion.
6. **No matter regeneration:** deleted `M` stays deleted. “Self-repair,” “healing,” or “regeneration” would therefore overstate the present result.

The best current description is that the CPU rule contains **robust localized attractor-like states that relax after perturbation**.

## What this does not establish

This experiment still does not establish:

- spontaneous emergence of localized individuality from distributed/noise initial conditions;
- active repair or damage sensing;
- metabolism in a strong sense;
- resource-seeking;
- reproduction, heredity, or evolution;
- agency or cognition.

The result is nevertheless useful because it separates two questions that visual inspection could easily conflate: robustness of a localized dynamical state versus a specialized repair response.

## Next CPU experiment before WebGPU

WebGPU should remain blocked for now. The next useful CPU work is:

- repeat perturbations across several geometries/directions/radii so the conclusion is not tied to the deterministic peak-voxel convention;
- test translated/rotated or otherwise shape-perturbed localized initial conditions, since numeric seed does not meaningfully diversify the current deterministic blob seeds;
- then run the controlled resource experiment with gradient reversal and resource cutoff/recovery against matched `M`-only controls;
- introduce `C` only if those experiments expose a concrete missing state variable.

If those checks continue to show a well-understood localized regime with interpretable resource coupling, the CPU rule will be in a much better position to serve as the WebGPU reference.
