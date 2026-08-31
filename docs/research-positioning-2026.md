# MUSIM research positioning and novelty update (2026)

This note supplements [`prior-art.md`](prior-art.md). It does **not** replace the original prior-art survey. Its purpose is narrower: clarify what is already established in adjacent research, what MUSIM should not claim as novel, and where a defensible research contribution may still exist as of August 2026.

## Research invariant

MUSIM's core question remains:

> Can robust, self-maintaining individuality emerge in a true 3D continuous artificial world from local dynamics, without predefined agents, creature objects, or fixed individual boundaries?

The substrate is an experimental choice. Flow-Lenia, voxel resolution, channel count, numerical scheme, WebGPU implementation, and visualization can all change without changing that research question.

## What is already established and is not MUSIM's novelty

### Continuous artificial-life patterns are not new

Lenia demonstrated that continuous cellular-automaton dynamics can produce spatially localized, mobile, life-like patterns. Expanded Lenia generalized the framework to higher dimensions and multiple channels. Therefore MUSIM should not claim novelty merely from using continuous fields, continuous-state cellular automata, localized patterns, or 3D Lenia-like dynamics.

### Emergent agency without a conventional agent object is not new

Sensorimotor Lenia studies whether sensorimotor-capable entities can arise in cellular-automaton environments from low-level material dynamics and environmental interactions. This is conceptually close to MUSIM's “world first, agent later” stance. MUSIM should therefore not claim that avoiding an explicit `Creature` class is itself unprecedented.

### Mass conservation and localized rule properties are not new

Flow-Lenia introduced mass-conservative Lenia dynamics and parameter localization, and demonstrated spatially localized patterns, multispecies worlds, and measurable evolutionary activity. The 2025 journal version further analyzes emergent evolutionary dynamics in this system. Mass conservation, parameter localization, and multispecies continuous-CA worlds are therefore prior art rather than MUSIM contributions.

### Environmental resources in Lenia are not new

“Lenia in a petri dish” introduced a resource channel whose local resource is consumed to maintain and grow Lenia body mass and then recovers over time. MUSIM should not claim novelty merely from adding an environmental resource field or coupling persistence to resource availability.

### 3D artificial-life-like localized motion is not new

Particle Lenia provides a direct 3D example of conserved matter forming a moving localized structure. Expanded Lenia also establishes higher-dimensional Lenia as prior art. A contribution framed only as “artificial life in 3D” would therefore be too weak.

### Automated exploration of Flow-Lenia worlds is not new

Michel et al. (2025) used a curiosity-driven AI scientist / IMGEP-style exploration process to search large Flow-Lenia environments using system-level metrics and reported more diverse ecosystemic dynamics than random search. MUSIM should treat systematic parameter and diversity search as established methodology rather than a novelty claim by itself.

## Where MUSIM may still have a defensible novelty claim

The literature reviewed so far supports each of several neighboring ingredients separately, but this survey has **not identified a direct prior demonstration of their full combination**:

1. a **true three-dimensional dense continuous field** as the habitat;
2. **mass-conservative material dynamics** rather than unconstrained growth/decay;
3. **environmental resource / free-energy flow** coupled to persistence or internal dynamics;
4. optional **internal-state or catalyst fields in the same spatial substrate** rather than in an externally defined controller;
5. **no predefined agent, creature object, or fixed individual boundary** in the simulation ontology;
6. explicit tests for **localization, persistence, perturbation recovery, and functional resource coupling** rather than judging visual novelty alone;
7. an observer that infers candidate individuality from the evolving fields rather than using simulation-side identities.

A defensible working contribution statement is therefore:

> MUSIM investigates whether robust, self-maintaining individuality can emerge in a true 3D mass-conservative continuous artificial world with environmental resource flows, without predefined agents or boundaries, and evaluates candidate individuality by persistence, perturbation recovery, and functional coupling rather than appearance alone.

This is a **novelty hypothesis**, not yet a novelty proof. The current search is broad but is not a formal systematic review. Until a more exhaustive literature review is performed, project documents should use wording such as:

> “In the literature reviewed so far, we have not identified a direct prior demonstration combining these conditions.”

Avoid wording such as “first ever,” “world first,” or “no previous work exists.”

## Important distinction: substrate novelty vs experimental novelty

MUSIM does not need to invent a wholly new mathematical substrate to make a research contribution.

Using Flow-Lenia-inspired mechanisms can be scientifically useful if the contribution lies in the **experimental question and regime**: true 3D conserved worlds, resource-driven non-equilibrium conditions, emergent boundaries, and controlled tests of self-maintenance.

Accordingly, the project should separate three levels of claim:

| Level | Appropriate claim |
| --- | --- |
| Existing mechanism | “Inspired by / adapted from Flow-Lenia, Lenia, and related work.” |
| MUSIM experimental construction | “A 3D conserved resource-coupled artificial world designed to test emergent individuality without predefined agents.” |
| Empirical contribution | Only claim what repeated experiments actually show: e.g. robust localization, recovery, resource-dependent persistence, or failure to obtain them. |

A negative result can still be informative. If a faithful 3D conservative field repeatedly fails to produce robust localized self-maintaining candidates under a documented search regime, that constrains the hypothesis that the 2D Flow-Lenia paradigm extends naturally to this stronger 3D world-first setting.

## Implications for v0 design

Before treating the current v0 update rule as the scientific reference implementation, MUSIM should distinguish infrastructure from experimental dynamics:

- keep the existing voxel/state/observer/testing infrastructure;
- use a literature-faithful Flow-Lenia-compatible reference or calibration fixture before inventing richer MUSIM-specific transport;
- establish an `M`-only baseline before adding resource coupling;
- add `R` only as an experimentally controlled environmental drive;
- add `C` only if needed to test internal-state organization;
- avoid direct “move toward resource” forces when the research question is whether resource-dependent behavior emerges from self-maintenance dynamics;
- compare gradient-on, gradient-reversed, coupling-disabled, and perturbation controls;
- use parameter/diversity search, because interesting Flow-Lenia-like patterns occupy restricted regions of parameter space;
- preserve the distinction between simulation ontology and observer-side candidate-individual tracking.

## Novelty checkpoint for later publication

Before making a formal novelty claim in a paper or submission, perform a dedicated literature pass covering at least:

- 3D / higher-dimensional Lenia and Flow-Lenia derivatives;
- resource-coupled Lenia and Flow-Lenia;
- mass-conservative continuous CA outside the Lenia family;
- artificial protocell and reaction-diffusion models with emergent boundaries;
- work on emergent individuality / agency in continuous media;
- 2025–2026 ALIFE proceedings, Artificial Life journal, arXiv, and related developmental-systems work.

Record the search terms, databases, dates, inclusion criteria, and closest negative matches. That future review should decide whether the contribution can be described as a first demonstration or only as a new combination / experimental test.

## References added or emphasized in this update

1. B. W.-C. Chan, **Lenia — Biology of Artificial Life** (2019). https://arxiv.org/abs/1812.05433
2. B. W.-C. Chan, **Lenia and Expanded Universe** (2020). https://arxiv.org/abs/2005.03742
3. E. Plantec et al., **Flow-Lenia: Towards open-ended evolution in cellular automata through mass conservation and parameter localization** (ALIFE 2023). https://arxiv.org/abs/2212.07906
4. E. Plantec et al., **Flow-Lenia: Emergent Evolutionary Dynamics in Mass Conservative Continuous Cellular Automata** (*Artificial Life*, 2025). https://doi.org/10.1162/artl_a_00471
5. T. Michel et al., **Exploring Flow-Lenia Universes with a Curiosity-driven AI Scientist: Discovering Diverse Ecosystem Dynamics** (2025). https://arxiv.org/abs/2505.15998
6. G. Hamon et al., **Learning Sensorimotor Capabilities in Cellular Automata / Sensorimotor Lenia**. https://developmentalsystems.org/sensorimotor-lenia/
7. R. Suzuki, K. Asakura, T. Arita, **Lenia in a petri dish: Interactions between organisms and their environment in a Lenia with growth based on resource consumption** (ALIFE 2023). https://doi.org/10.1162/isal_a_00613
8. A. Mordvintsev, E. Niklasson, E. Randazzo, **Particle Lenia and the energy-based formulation**. https://google-research.github.io/self-organising-systems/particle-lenia/

## Current assessment

As of August 2026:

- the **general ambition** of emergent artificial life in continuous media is established prior art;
- the **individual ingredients** of Lenia-like locality, mass conservation, resource fields, emergent agency, and 3D artificial-life structures each have strong precedents;
- MUSIM's strongest potential contribution is the **specific integrated experimental regime and its evaluation protocol**, not any one ingredient;
- whether that contribution becomes publishable novelty depends on the actual empirical result and a later systematic novelty review.
