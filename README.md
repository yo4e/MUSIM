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

## Initial world model

A possible MUSIM world may contain several continuous quantities, for example:

- matter / density
- energy
- chemical fields
- temperature
- light
- flow / velocity
- membrane or boundary-forming dynamics
- internal signaling or neural-like activity

These are not fixed requirements. The first phase is research: determine which existing artificial-life substrates are closest to the idea and which minimal system is worth implementing.

## Technical direction

The browser is the intended habitat and observation instrument.

A likely architecture is:

```text
continuous simulation layer
    ↓
3D scalar / vector fields or particles
    ↓
GPU compute (WebGPU)
    ↓
Three.js visualization
    ↓
volume rendering / particles / isosurfaces
    ↓
human observation
```

Three.js is primarily the visualization and browser-world layer. The simulation itself should remain conceptually separable so that different substrates—continuous cellular automata, particles, reaction-diffusion systems, or hybrids—can be tested.

Current Three.js support for WebGPU compute and `Storage3DTexture` makes GPU-updated 3D fields a plausible implementation route.

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

## First step

**Survey prior work before choosing the simulation substrate.**

See [`docs/prior-art.md`](docs/prior-art.md) for the initial research map.

## Status

Concept / research phase.
