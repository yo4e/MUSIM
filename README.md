# MUSIM

**Emergent artificial life in a continuous 3D world.**

MUSIM is an experimental artificial-life project exploring whether organism-like behavior can emerge from continuous dynamics inside a browser-based 3D world.

The central idea is simple:

> Do not program creatures. Build a world in which something creature-like can emerge.

Rather than representing a creature as a conventional object with explicit variables such as `hunger`, `fear`, or `target`, MUSIM aims to model continuous fields and local interactions: matter, energy, chemical concentrations, gradients, flow, membrane-like boundaries, and internal activity. If something begins to persist, move, consume energy, maintain itself, reproduce, or develop recognizable individuality, we observe it as an emergent phenomenon rather than a predefined agent.

## Core questions

- Can a digital computer host a useful approximation of an analog-like continuous world?
- Can recognizable individuals emerge without a predefined `Creature` class?
- Can metabolism-like behavior arise from energy and material flows rather than an explicit `hunger` variable?
- Can internal continuous dynamics produce preference, attraction, avoidance, or other behavior that looks like primitive desire?
- What conditions allow persistence, self-maintenance, reproduction, variation, and open-ended evolution?
- How should we define an individual when boundaries themselves are emergent?

## Research positioning

The broad ingredients above have substantial prior art. MUSIM does **not** claim novelty merely from continuous artificial life, 3D Lenia-like worlds, emergent agency, mass conservation, resource fields, or parameter search individually.

The current novelty hypothesis is the integrated experimental regime: a true-3D dense conserved field with environmental resource flow and optional same-substrate internal state, no predefined agents or fixed individual boundaries, and controlled evaluation of persistence, perturbation recovery, and functional resource coupling.

See:

- [`docs/prior-art.md`](docs/prior-art.md) — prior-art survey and substrate choice
- [`docs/research-positioning-2026.md`](docs/research-positioning-2026.md) — what is already established, what MUSIM may contribute, and claims to avoid

## Chosen v0 substrate

The first experimental substrate is a **Flow-Lenia-inspired, mass-conserving, multi-channel continuous field** in a small true-3D voxel world.

The choice is conceptual rather than a claim that existing Flow-Lenia work already demonstrates MUSIM's intended 3D system. Flow-Lenia motivates affinity-driven conservative transport and localized state. MUSIM's resource/internal-state channels and true-3D experimental regime are project-specific hypotheses to test.

The initial channels are:

- `M` — conserved matter
- `R` — an open resource / free-energy candidate
- `C` — an optional catalyst / internal-state candidate

There is deliberately no `Creature` class and no individual ID in the simulation state.

## Current v0 CPU reference

The first browser slice proved the infrastructure: periodic 3D state, deterministic seeds, conservation checks, metrics, a cheap central slice observer, and GitHub Pages deployment.

A subsequent design review separated that initial diffusion-dominated rule from the scientific reference dynamics. The current CPU reference now uses:

- a normalized isotropic shell convolution over `M`;
- a smooth local target-density response to form an affinity field;
- affinity differences plus concentration pressure to define local flow preferences;
- bounded six-neighbor redistribution that conserves matter without a world-wide correction;
- a clean default `M`-only baseline with uniform, non-coupled `R` and disabled `C`;
- a separate resource-coupled experiment in which `R` modifies local affinity conditions rather than injecting a direct “seek resource” command;
- periodic-aware centroid measurement;
- tests for conservation, non-negativity, locality, symmetry, determinism, and periodic observation.

This implementation is **Flow-Lenia-inspired, not a literal Flow-Lenia implementation**. It uses a simpler local voxel transport scheme rather than published reintegration tracking. See [`docs/v0-reference.md`](docs/v0-reference.md) for the exact contract.

### Run locally

```bash
npm install
npm test
npm run typecheck
npm run dev
```

The browser offers two explicit conditions:

- **M-only baseline** — `R` is uniform and does not feed back into `M`; `C` is disabled.
- **resource-coupled** — an `R` gradient, local resource consumption/recovery, and resource-dependent affinity are enabled as a controlled experiment.

The current browser view is an observation/debugging instrument, not the final visualization. The simulation is 3D even though the default observer shows a central 2D slice.

## Technical direction

The browser is the intended habitat and observation instrument.

```text
continuous simulation layer
    ↓
3D scalar / vector fields
    ↓
CPU scientific reference → WebGPU compute
    ↓
browser visualization
    ↓
volume slices / projections / later isosurfaces
    ↓
human + metric observation
```

WebGPU is intentionally downstream of the CPU reference review. The stable GPU version should keep dense 3D state on the GPU, use fixed-step ping-pong updates, compare small fixtures against the CPU implementation, and avoid full-volume readback on the per-frame path.

## Design principle

A conventional agent might say:

```text
hunger = 0.8
if hunger > 0.7:
    seek_food()
```

MUSIM is interested in the opposite direction:

```text
energy decreases
    ↓
internal chemistry changes
    ↓
sensorimotor dynamics change
    ↓
motion changes
    ↓
the system approaches an energy source
```

No variable needs to be called “hunger.” If an observer nevertheless wants to call the resulting behavior hunger, that is the interesting part.

## Status

**v0 implementation / experiment phase.**

Issue #3 is the durable project-level restart point. Issue #7 is the current implementation unit: refine and validate the CPU scientific reference dynamics before any WebGPU port.
