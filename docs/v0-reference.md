# MUSIM v0 CPU reference rule

This note defines the contract of the CPU scientific-reference implementation for Issue #3 / Issue #7. It is intentionally narrower than the research survey in [`prior-art.md`](prior-art.md) and the novelty/positioning note in [`research-positioning-2026.md`](research-positioning-2026.md).

## Research role

The browser world remains a true 3D continuous-field experiment represented numerically on a periodic voxel grid. There are no creature objects or simulation-side individual identifiers.

The state currently has three scalar channels:

- `M`: conserved matter
- `R`: open environmental resource / free-energy candidate
- `C`: optional catalyst / internal-state candidate

The first PR (#5) established the 3D grid, conservation infrastructure, deterministic seeds, browser observer, tests, and Pages deployment. Its diffusion-dominated transport rule should be understood as a **transport smoke test**, not as the finalized scientific dynamics.

Issue #7 replaces that smoke-test rule with an affinity-driven conservative reference before any WebGPU port.

## Relationship to Flow-Lenia

Flow-Lenia is the main structural inspiration. Its published model computes a Lenia-style affinity map, uses the spatial affinity gradient together with a concentration-gradient term to define flow, and transports matter conservatively with reintegration tracking.

References:

- Plantec et al., *Flow-Lenia: Towards open-ended evolution in cellular automata through mass conservation and parameter localization* (ALIFE 2023): <https://arxiv.org/abs/2212.07906>
- official model note: <https://sites.google.com/view/flowlenia/model>
- authors' reference implementation: <https://github.com/erwanplantec/FlowLenia>

MUSIM currently adopts the high-level structure:

```text
matter field
  ↓ isotropic shell convolution + smooth response
affinity field
  ↓ local affinity difference + concentration pressure
local flow preferences
  ↓ bounded source budgets + pairwise redistribution
next conserved matter field
```

This is **Flow-Lenia-inspired, not a literal Flow-Lenia implementation**. In particular, the current CPU reference uses six-neighbor bounded voxel transfers instead of published reintegration tracking. Project documents must keep that distinction explicit unless a later implementation is faithful enough to justify stronger wording.

## Matter `M` contract

### Affinity

Each voxel computes a local matter density using a normalized isotropic Gaussian shell kernel. A smooth target-density response maps that convolution to an affinity value.

The default baseline has no `R` or `C` feedback into affinity.

### Flow

For adjacent voxels `i` and `j`, the desired direction is computed from two antisymmetric terms:

1. affinity difference: matter tends toward the neighbor with greater affinity;
2. concentration pressure: matter tends away from greater local concentration.

Because both terms reverse sign when `i` and `j` are swapped, the rule does not privilege the +x/+y/+z traversal directions.

### Conservative local redistribution

All outgoing preferences are calculated from the unchanged old state. A voxel may export at most `maxTransportFraction` of its old matter in one step. Its outgoing transfers are divided among the six axial neighbors according to the local flow preferences.

Each transfer subtracts and adds the same amount. Therefore the intended invariant is:

```text
sum(M[t + 1]) ~= sum(M[t])
```

within floating-point tolerance.

The source budget prevents negative matter by construction. There is **no world-wide proportional rescaling or other global post-step conservation correction**.

## Baseline before resource coupling

The default experiment is deliberately an `M`-only dynamics baseline:

- `R` starts uniform;
- resource consumption and recovery are disabled;
- `resourceInfluence = 0`, so `R` does not feed back into `M`;
- `C` production and influence are disabled.

This baseline is required so localization or motion cannot be accidentally attributed to a built-in resource gradient.

## Controlled resource experiment `R`

The resource-coupled preset is a separate experimental condition rather than part of the baseline.

In that mode:

- the initial `R` field may contain an x-gradient;
- `R` diffuses;
- `R` recovers toward capacity;
- overlap with `M` consumes `R`;
- local `R` changes the preferred density used by the affinity response.

The implementation does **not** add a direct "move toward resource" vector or an agent-side goal. Any apparent resource-seeking must therefore be evaluated against matched controls and should not be called hunger, purpose, or cognition merely from visual motion.

## Optional catalyst/internal state `C`

`C` remains part of the state schema but is disabled in the default and resource presets. It should only be activated when a concrete experiment requires an additional local state channel and can test what that channel changes.

This follows the project rule: add internal semantics only when needed rather than programming a proto-agent in advance.

## Determinism and fixtures

The implementation includes deterministic seeded initial states:

- one localized blob;
- two localized blobs;
- low-density random noise.

Resource initialization is explicit:

- `uniform` is the default baseline;
- `gradient-x` is opt-in for resource experiments.

The same `stepReference()` implementation must run with `z = 1`. That degenerate world is a debugging/reference fixture, not a claim that the model is fundamentally 2D.

## Observability contract

At minimum, runs expose:

- total `M`, `R`, and `C`;
- periodic-aware matter centroid;
- occupied voxel count above a small observation threshold;
- a cheap orthogonal slice.

The centroid uses circular means per periodic axis so a localized candidate crossing an edge is not incorrectly reported as jumping through the middle of the world.

Future experiments should add candidate lifetime, perturbation recovery, parameter/seed robustness, and resource-control comparisons without adding individual IDs to the simulation ontology.

## Required reference tests

Before WebGPU work, the CPU reference should cover:

- repeated matter conservation;
- finite and non-negative `M`;
- periodic boundary transport;
- low-dimensional fixture support;
- axis symmetry for symmetric initial conditions;
- locality: a sufficiently distant perturbation cannot affect a one-step local neighborhood;
- deterministic seeds;
- uniform-resource M-only baseline independence;
- controlled open-resource dynamics;
- periodic-aware observation.

Passing these tests validates implementation invariants. It does **not** establish that organism-like localization has emerged.

## Calibration and search order

1. verify invariants and low-dimensional fixtures;
2. run a clean `M`-only 3D baseline;
3. explore multiple seeds and parameter neighborhoods for persistent localization;
4. add controlled resource coupling and matched controls;
5. add `C` only if a specific hypothesis requires it;
6. apply perturbations to any long-lived candidates;
7. port the understood CPU rule to WebGPU.

A single visually interesting run is not sufficient evidence. Conversely, a documented failure to obtain robust localization after a meaningful search can itself be an informative negative result.

## WebGPU port contract

The WebGPU implementation remains blocked until the CPU rule and its experimental meaning are understood.

When ported, the GPU version should:

- use fixed-step updates;
- keep dense 3D state resident on the GPU;
- use ping-pong state storage or an equivalent race-free scheme;
- preserve total `M` within an explicitly recorded tolerance;
- produce finite, non-negative matter values;
- reproduce the CPU reference invariants on small fixtures;
- avoid full-volume CPU readback in the normal per-frame path;
- keep `R/C` semantics visibly separate from literature-backed Flow-Lenia claims.

Exact floating-point identity between CPU and GPU is not required. Invariants and bounded fixture divergence are.

## Current limitation

The affinity-driven CPU rule is an experimental substrate, not evidence of life. Until repeated trials demonstrate otherwise, MUSIM should say only that it provides a local, mass-conservative 3D world in which localization, self-maintenance, and resource coupling can be tested.
