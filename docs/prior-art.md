# Prior-art map

This document is the starting map for MUSIM research. It is intentionally broader than a bibliography: the goal is to identify which existing ideas are technically and conceptually closest to a browser-based 3D artificial-life world built from continuous dynamics.

## 1. Continuous cellular automata

### Lenia

Bert Wang-Chak Chan's Lenia generalizes cellular automata toward continuous states, time, and space and produces persistent, mobile, life-like localized patterns.

- Paper / project family: **Lenia — Biology of Artificial Life**
- Why it matters to MUSIM: establishes that simple continuous local dynamics can produce patterns that observers naturally treat as organisms.
- Research question: which Lenia properties are essential, and which are artifacts of a particular update rule?

### Lenia and Expanded Universe (2020)

Bert Wang-Chak Chan generalized Lenia into higher dimensions, multiple kernels, and multiple channels. Reported phenomena include polyhedral symmetries, individuality, self-replication, emission, growth by ingestion, and “virtual eukaryotes” with internal differentiation.

- MIT Press: https://direct.mit.edu/isal/article/doi/10.1162/isal_a_00297/98400/Lenia-and-Expanded-Universe
- DOI: https://doi.org/10.1162/isal_a_00297
- Why it matters: directly demonstrates that the Lenia family can be extended beyond 2D and can support richer internal organization.
- MUSIM angle: inspect the 3D formulation before deciding whether to use voxels, particles, or a hybrid substrate.

### Flow-Lenia

Flow-Lenia adds mass conservation and localizes rule parameters inside the simulated world, enabling different emerging forms to coexist under locally coherent dynamics.

- Google Research / ALIFE 2023: https://research.google/pubs/flow-lenia-towards-open-ended-evolution-in-cellular-automata-through-mass-conservation-and-parameter-localization/
- Artificial Life journal version: https://direct.mit.edu/artl/article/31/2/228/130572/Flow-Lenia-Emergent-Evolutionary-Dynamics-in-Mass
- Why it matters: conservation laws and localized parameters are extremely close to MUSIM's desire to make “properties of the organism” part of the world rather than metadata attached to a `Creature` object.
- MUSIM angle: study whether metabolism-like dynamics can be expressed as redistribution and transformation of conserved quantities.

## 2. Particle-based continuous artificial life

### Particle Lenia

Alexander Mordvintsev, Eyvind Niklasson, and Ettore Randazzo reformulated Lenia-inspired dynamics as interacting particles in continuous space. The authors explicitly note that particle systems scale naturally from 2D to 3D.

- Project / explanation: https://google-research.github.io/self-organising-systems/particle-lenia/
- Why it matters: may be substantially easier than a dense 3D voxel field while preserving local continuous dynamics and mass conservation.
- MUSIM angle: compare computational cost, visual quality, emergence, and extensibility of particle vs. field substrates.

### Swarm Chemistry

Hiroki Sayama proposed an artificial chemistry in which reactions are not predefined symbolic reaction rules but emerge from kinetic interactions between populations with different movement characteristics.

- PubMed: https://pubmed.ncbi.nlm.nih.gov/18855565/
- DOI: https://doi.org/10.1162/artl.2009.15.1.15107
- Why it matters: strong precedent for treating “chemistry” as emergent spatiotemporal behavior rather than a list of explicit reactions.
- MUSIM angle: useful reference if multiple material or behavioral species are introduced.

## 3. Embodied virtual creatures and evolution

### Karl Sims — Evolving Virtual Creatures (1994)

Karl Sims evolved both morphology and neural control in simulated 3D physical worlds. Creatures developed locomotion, swimming, jumping, and light-following behavior under genetic selection.

- ACM: https://doi.org/10.1145/192161.192167
- Author page / video: https://www.karlsims.com/evolved-virtual-creatures.html
- Why it matters: foundational precedent for allowing morphology and control to co-evolve in a virtual 3D environment instead of hand-designing agents.
- Difference from MUSIM: Sims still evolves explicit creature bodies and controllers; MUSIM is interested in whether the creature boundary itself can emerge from the substrate.

## 4. Self-organizing systems adjacent to MUSIM

Google Research's Self Organising Systems collection includes work on neural cellular automata, reaction-diffusion, Particle Lenia, differentiable chemical reaction networks, and related models.

- Index: https://google-research.github.io/self-organising-systems/
- Why it matters: useful survey hub for modern differentiable and self-organizing approaches.

Topics to inspect next:

- neural cellular automata
- reaction-diffusion systems
- artificial chemistry
- continuous-time recurrent neural networks (CTRNN)
- sensorimotor Lenia
- morphological computation / embodied intelligence
- physical reservoir computing
- autopoiesis models
- protocell / wet artificial-life literature
- open-ended evolution metrics

## 5. Browser / 3D implementation feasibility

### Three.js + WebGPU

Three.js currently exposes GPU compute facilities through `WebGPURenderer`, including 3D storage textures.

- `Storage3DTexture`: https://threejs.org/docs/pages/Storage3DTexture.html
- official 3D compute-texture example: https://threejs.org/examples/webgpu_compute_texture_3d.html
- Why it matters: a dense 3D continuous field can plausibly remain on the GPU for simulation and visualization rather than being copied through JavaScript each step.

Possible rendering approaches:

- volume rendering
- point / particle rendering
- thresholded density visualization
- marching cubes / isosurfaces
- multiple overlaid scalar fields

## Key distinctions MUSIM should preserve

During research, avoid collapsing several different ideas into “3D artificial life.” MUSIM is specifically interested in the following distinctions:

### Predefined agent vs. emergent individual

Does the simulation create a `Creature` first, or do we identify a persistent structure after it appears?

### Symbolic internal state vs. physicalized internal state

Is “hunger” stored as a named variable, or does resource depletion alter continuous internal dynamics such that food-seeking behavior emerges?

### Geometry plus controller vs. substrate-level organization

Is a body mesh controlled by a brain, or are body, boundary, signaling, and behavior all patterns of the same underlying substrate?

### Visual novelty vs. biological organization

A beautiful moving blob is not automatically interesting artificial life. We should look for measurable properties such as persistence, homeostasis, resource use, regeneration, reproduction, heredity, variation, adaptation, and evolutionary activity.

## Initial research questions

1. What is the smallest known continuous artificial-life model that produces robust localized mobile structures in 3D?
2. Is a dense 3D field practical in-browser, or should MUSIM begin with particles?
3. Which conservation laws are necessary to prevent trivial explosion or extinction?
4. How have prior systems represented resources, metabolism, or homeostasis without explicit agent-level variables?
5. How can an emergent individual be detected automatically when no creature ID exists?
6. Which systems support multiple persistent forms in the same world under the same laws?
7. What mechanisms have produced reproduction plus heritable variation rather than mere pattern copying?
8. What metrics are used to distinguish open-ended evolution from transient novelty?
9. Which parts of a system should remain deterministic, and where might noise improve exploration or individuality?
10. What visualization methods make a genuinely 3D internal structure observable without turning the project into a rendering problem first?

## Near-term output of the survey

Before implementation, produce a short comparison of candidate substrates:

| Candidate | 3D feasibility | Conservation | Emergent boundary | Evolution potential | Browser/GPU fit | Complexity |
| --- | --- | --- | --- | --- | --- | --- |
| Lenia / 3D Lenia | TBD | TBD | TBD | TBD | TBD | TBD |
| Flow-Lenia | TBD | TBD | TBD | TBD | TBD | TBD |
| Particle Lenia | TBD | TBD | TBD | TBD | TBD | TBD |
| Reaction-diffusion | TBD | TBD | TBD | TBD | TBD | TBD |
| Artificial chemistry | TBD | TBD | TBD | TBD | TBD | TBD |
| Hybrid field + particles | TBD | TBD | TBD | TBD | TBD | TBD |

The first engineering decision should follow this comparison rather than precede it.
