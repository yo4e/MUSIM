import './style.css';
import { createSeededState, type SeedKind, type ResourceProfile } from './sim/seed';
import { measure } from './sim/metrics';
import {
  defaultStepParams,
  resourceExperimentStepParams,
  stepReference,
  type StepParams,
} from './sim/step';
import type { SimState } from './sim/state';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing #app');

type ExperimentMode = 'baseline' | 'resource';

app.innerHTML = `
  <section class="shell">
    <header>
      <p class="eyebrow">MUSIM / v0 scientific reference</p>
      <h1>Conserved 3D field</h1>
      <p class="lede">Affinity-driven CPU reference for the MUSIM experiment. No Creature objects, no individual IDs.</p>
    </header>
    <div class="controls">
      <label>Experiment
        <select id="experiment-mode">
          <option value="baseline">M-only baseline</option>
          <option value="resource">resource-coupled</option>
        </select>
      </label>
      <label>Seed
        <select id="seed-kind">
          <option value="single">single blob</option>
          <option value="double">two blobs</option>
          <option value="noise">random noise</option>
        </select>
      </label>
      <button id="reset">Reset</button>
      <button id="step">Step ×10</button>
      <button id="run">Run</button>
    </div>
    <div class="grid">
      <canvas id="slice" width="512" height="512" aria-label="central matter slice"></canvas>
      <aside>
        <h2>Observation</h2>
        <p id="experiment-note" class="note"></p>
        <dl id="metrics"></dl>
        <p class="note">The simulation is true 3D; this observer intentionally shows one central z-slice plus scalar metrics. WebGPU remains blocked until the CPU reference dynamics are understood.</p>
      </aside>
    </div>
  </section>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#slice')!;
const ctx = canvas.getContext('2d')!;
const metrics = document.querySelector<HTMLElement>('#metrics')!;
const experimentNote = document.querySelector<HTMLElement>('#experiment-note')!;
const modeSelect = document.querySelector<HTMLSelectElement>('#experiment-mode')!;
const kindSelect = document.querySelector<HTMLSelectElement>('#seed-kind')!;
const resetButton = document.querySelector<HTMLButtonElement>('#reset')!;
const stepButton = document.querySelector<HTMLButtonElement>('#step')!;
const runButton = document.querySelector<HTMLButtonElement>('#run')!;

function experimentConfig(mode: ExperimentMode): {
  params: StepParams;
  resourceProfile: ResourceProfile;
  note: string;
} {
  if (mode === 'resource') {
    return {
      params: resourceExperimentStepParams,
      resourceProfile: 'gradient-x',
      note: 'Resource experiment: R has an x-gradient, is consumed/recovered, and modulates the local affinity response.',
    };
  }
  return {
    params: defaultStepParams,
    resourceProfile: 'uniform',
    note: 'M-only baseline: R is uniform and does not feed back into M; C is disabled.',
  };
}

function makeState(): SimState {
  const mode = modeSelect.value as ExperimentMode;
  const { resourceProfile } = experimentConfig(mode);
  return createSeededState(
    { x: 32, y: 32, z: 32 },
    kindSelect.value as SeedKind,
    1,
    { resourceProfile },
  );
}

let state: SimState = makeState();
let ticks = 0;
let running = false;
let raf = 0;

function drawSlice(): void {
  const z = Math.floor(state.size.z / 2);
  const image = ctx.createImageData(state.size.x, state.size.y);
  for (let y = 0; y < state.size.y; y += 1) {
    for (let x = 0; x < state.size.x; x += 1) {
      const i = x + state.size.x * (y + state.size.y * z);
      const p = (x + state.size.x * y) * 4;
      const m = Math.min(1, state.matter[i] * 8);
      const r = Math.min(1, state.resource[i]);
      const c = Math.min(1, state.catalyst[i] * 8);
      image.data[p] = Math.round(255 * m);
      image.data[p + 1] = Math.round(255 * c);
      image.data[p + 2] = Math.round(255 * r * 0.7);
      image.data[p + 3] = 255;
    }
  }
  const scratch = document.createElement('canvas');
  scratch.width = state.size.x;
  scratch.height = state.size.y;
  scratch.getContext('2d')!.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(scratch, 0, 0, canvas.width, canvas.height);
}

function render(): void {
  drawSlice();
  const m = measure(state);
  experimentNote.textContent = experimentConfig(modeSelect.value as ExperimentMode).note;
  metrics.innerHTML = `
    <div><dt>ticks</dt><dd>${ticks}</dd></div>
    <div><dt>matter</dt><dd>${m.matterTotal.toFixed(6)}</dd></div>
    <div><dt>resource</dt><dd>${m.resourceTotal.toFixed(2)}</dd></div>
    <div><dt>catalyst</dt><dd>${m.catalystTotal.toFixed(3)}</dd></div>
    <div><dt>occupied cells</dt><dd>${m.occupiedCells}</dd></div>
    <div><dt>periodic centroid</dt><dd>${m.centroid.x.toFixed(1)}, ${m.centroid.y.toFixed(1)}, ${m.centroid.z.toFixed(1)}</dd></div>
  `;
}

function advance(count: number): void {
  const { params } = experimentConfig(modeSelect.value as ExperimentMode);
  for (let i = 0; i < count; i += 1) {
    state = stepReference(state, params);
    ticks += 1;
  }
  render();
}

function stopAndReset(): void {
  running = false;
  cancelAnimationFrame(raf);
  runButton.textContent = 'Run';
  state = makeState();
  ticks = 0;
  render();
}

function loop(): void {
  if (!running) return;
  advance(1);
  raf = requestAnimationFrame(loop);
}

resetButton.addEventListener('click', stopAndReset);
modeSelect.addEventListener('change', stopAndReset);
kindSelect.addEventListener('change', stopAndReset);
stepButton.addEventListener('click', () => advance(10));
runButton.addEventListener('click', () => {
  running = !running;
  runButton.textContent = running ? 'Pause' : 'Run';
  if (running) loop();
});

render();
