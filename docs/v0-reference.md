# MUSIM v0 reference rule

This note defines the contract of the CPU reference implementation introduced for Issue #3. It is intentionally narrower than the research survey in [`prior-art.md`](prior-art.md).

## What this model is

The reference model is a small, deterministic, periodic 3D field with three scalar channels:

- `M`: conserved matter
- `R`: open resource / free-energy candidate
- `C`: catalyst / internal-state candidate

There are no creature objects or individual identifiers in the state.

The model is **Flow-Lenia-inspired**, not a literal implementation of Flow-Lenia. The prior-art result motivates mass-conserving transport and localized state. The specific `R` and `C` dynamics here are MUSIM experimental choices.

## Update contract

### Matter `M`

`M` moves by pairwise fluxes across the six axial neighbors of the periodic voxel grid. Each undirected edge applies equal and opposite updates to its two endpoints. Therefore transport cannot intentionally create or destroy matter.

The current reference flux combines:

1. ordinary local redistribution from matter gradients;
2. a bounded bias from the local resource gradient;
3. a small mobility modulation from `C`.

After transport, numerical negative values are removed and the corresponding deficit is taken proportionally from positive cells so the correction does not manufacture mass.

The invariant to preserve is:

```text
sum(M[t + 1]) ~= sum(M[t])
```

within floating-point tolerance.

### Resource `R`

`R` is deliberately not conserved. It:

- diffuses locally;
- recovers toward a configurable capacity;
- is depleted where matter and resource overlap.

This is an experimental environmental drive, not a claim of complete metabolism.

### Catalyst `C`

`C` is optional local state. It grows from `M/R` overlap and decays otherwise. It exists to test whether an internal-state-like channel can become spatially associated with persistent matter without introducing an agent object.

## Determinism and fixtures

The implementation includes deterministic seeded initial states:

- one localized blob;
- two localized blobs;
- low-density random noise.

The same rule must also run with `z = 1`. That degenerate world is a debugging/reference fixture, not a separate product mode.

## Observability contract

At minimum, runs expose:

- total `M`, `R`, and `C`;
- matter centroid;
- occupied voxel count above a small observation threshold;
- a cheap orthogonal slice.

Future experiments should add perturbation/recovery measurements without adding creature IDs to the simulation.

## WebGPU port contract

The WebGPU implementation should be considered correct only after a small fixture can be compared with this CPU reference at fixed step counts.

The GPU version should:

- use fixed-step updates;
- keep dense 3D state resident on the GPU;
- use ping-pong state storage or an equivalent race-free scheme;
- preserve total `M` within an explicitly recorded tolerance;
- produce finite, non-negative matter values;
- avoid full-volume CPU readback in the normal per-frame path;
- keep `R/C` semantics visibly separate from literature-backed Flow-Lenia claims.

Exact floating-point identity between CPU and GPU is not required. Invariants and bounded fixture divergence are.

## Current limitation

The reference rule establishes infrastructure and conservation behavior; it does **not** yet demonstrate a persistent organism-like localized structure. Parameter search and/or a richer conservative transport rule may be necessary. That distinction must remain explicit when evaluating v0.
