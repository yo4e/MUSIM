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

## Chosen v0 substrate

The prior-art survey selected a **Flow-Lenia-inspired, mass-conserving, multi-channel continuous field** as the first experimental substrate. See [`docs/prior-art.md`](docs/prior-art.md).

The choice is conceptual rather than a claim that existing Flow-Lenia work already demonstrates MUSIM's intended 3D system. Flow-Lenia motivates conservative transport and localized state. MUSIM's first experiment adds project-specific resource/internal-state candidates and treats the true-3D extension itself as a hypothesis to test.

The initial channels are:

- `M` — conserved matter
- `R` — an open resource / free-energy candidate
- `C` — an optional catalyst / internal-state candidate

There is deliberately no `Creature` class and no individual ID in the simulation state.

## Current v0 reference implementation

The first implementation slice is a CPU reference model used as a test oracle before the WebGPU compute version:

- periodic 3D grid
- conservative pairwise transport for `M`
- resource diffusion, recovery, and local depletion for `R`
- simple local catalyst dynamics for `C`
- deterministic single-blob, two-blob, and noise seeds
- matter/resource/catalyst totals, centroid, and occupied-volume metrics
- a cheap central orthogonal slice for observation
- conservation tests

The CPU rule is **not** presented as Flow-Lenia itself. It is a deliberately inspectable MUSIM reference rule implementing the design constraints selected by the research phase.

### Run locally

```bash
npm install
npm test
npm run typecheck
npm run dev
```

The current browser view is an observation/debugging instrument, not the final visualization.

## Technical direction

The browser is the intended habitat and observation instrument.

```text
continuous simulation layer
    ↓
3D scalar / vector fields
    ↓
CPU reference oracle → WebGPU compute
    ↓
Three.js / browser visualization
    ↓
volume slices / projections / later isosurfaces
    ↓
human + metric observation
```

The WebGPU stage should keep the dense 3D state on the GPU, use fixed-step ping-pong updates, and compare small fixtures against the CPU reference implementation. Full-volume readback should not be part of the per-frame path.

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

Prior-art survey and substrate selection are complete. The current task is Issue #3: implement and validate the first conserved 3D field experiment, then port the stable reference dynamics to WebGPU.
