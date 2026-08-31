import './style.css';
import { createSeededState, type SeedKind } from './sim/seed';
import { measure } from './sim/metrics';
import { stepReference } from './sim/step';
import type { SimState } from './sim/state';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing #app');

app.innerHTML = `
  <section class="shell">
    <header>
      <p class="eyebrow">MUSIM / v0 reference substrate</p>
      <h1>Conserved 3D field</h1>
      <p class="lede">CPU reference model for the first MUSIM experiment. No Creature objects, no individual IDs.</p>
    </header>
    <div class="controls">
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
        <dl id="metrics"></dl>
        <p class="note">This view is deliberately cheap: a central orthogonal slice plus scalar metrics. WebGPU is the next execution layer; this CPU model is the reference oracle.</p>
      </aside>
    </div>
  </section>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#slice')!;
const ctx = canvas.getContext('2d')!;
const metrics = document.querySelector<HTMLElement>('#metrics')!;
const kindSelect = document.querySelector<HTMLSelectElement>('#seed-kind')!;
const resetButton = document.querySelector<HTMLButtonElement>('#reset')!;
const stepButton = document.querySelector<HTMLButtonElement>('#step')!;
const runButton = document.querySelector<HTMLButtonElement>('#run')!;

let state: SimState = createSeededState({ x: 32, y: 32, z: 32 }, 'single', 1);
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
  metrics.innerHTML = `
    <div><dt>ticks</dt><dd>${ticks}</dd></div>
    <div><dt>matter</dt><dd>${m.matterTotal.toFixed(6)}</dd></div>
    <div><dt>resource</dt><dd>${m.resourceTotal.toFixed(2)}</dd></div>
    <div><dt>catalyst</dt><dd>${m.catalystTotal.toFixed(3)}</dd></div>
    <div><dt>occupied cells</dt><dd>${m.occupiedCells}</dd></div>
    <div><dt>centroid</dt><dd>${m.centroid.x.toFixed(1)}, ${m.centroid.y.toFixed(1)}, ${m.centroid.z.toFixed(1)}</dd></div>
  `;
}

function advance(count: number): void {
  for (let i = 0; i < count; i += 1) {
    state = stepReference(state);
    ticks += 1;
  }
  render();
}

function loop(): void {
  if (!running) return;
  advance(1);
  raf = requestAnimationFrame(loop);
}

resetButton.addEventListener('click', () => {
  running = false;
  cancelAnimationFrame(raf);
  runButton.textContent = 'Run';
  state = createSeededState({ x: 32, y: 32, z: 32 }, kindSelect.value as SeedKind, 1);
  ticks = 0;
  render();
});
stepButton.addEventListener('click', () => advance(10));
runButton.addEventListener('click', () => {
  running = !running;
  runButton.textContent = running ? 'Pause' : 'Run';
  if (running) loop();
});

render();
