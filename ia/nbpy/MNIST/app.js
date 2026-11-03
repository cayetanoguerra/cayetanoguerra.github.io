// Interfaz: dibujo, preprocesado estilo MNIST y visualización.
const net = new CNN(MNIST_WEIGHTS);

const draw = document.getElementById('draw');
const ctx = draw.getContext('2d');
const in28 = document.getElementById('input28');
const ctx28 = in28.getContext('2d');
const thick = document.getElementById('thick');
const digitEl = document.getElementById('digit');
const confEl = document.getElementById('conf');

document.getElementById('info').textContent =
  `${net.nParams.toLocaleString('es-ES')} parámetros entrenables. ` +
  `Entrenada con los 60 000 dígitos de entrenamiento de MNIST (con pequeñas rotaciones, ` +
  `escalados y cambios de grosor como aumento de datos) y evaluada con los 10 000 de test.`;

// ---------- Barras de probabilidad ----------
const barsEl = document.getElementById('bars');
const bars = [];
for (let d = 0; d < 10; d++) {
  const row = document.createElement('div');
  row.className = 'bar';
  row.innerHTML = `<b>${d}</b><div class="track"><div class="fill"></div></div><span>0,0 %</span>`;
  barsEl.appendChild(row);
  bars.push({ row, fill: row.querySelector('.fill'), txt: row.querySelector('span') });
}

// ---------- Mapas de activación ----------
function makeMaps(id, n, size) {
  const el = document.getElementById(id), list = [];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    el.appendChild(c);
    list.push(c.getContext('2d'));
  }
  return list;
}
const maps1 = makeMaps('maps1', 16, 28);
const maps2 = makeMaps('maps2', 32, 14);

function paintMaps(list, act, size) {
  const n = size * size;
  list.forEach((c, k) => {
    let mx = 1e-6;
    for (let i = 0; i < n; i++) mx = Math.max(mx, act[k * n + i]);
    const img = c.createImageData(size, size);
    for (let i = 0; i < n; i++) {
      const v = act[k * n + i] / mx;
      // escala de color: negro → naranja → amarillo claro
      img.data[4 * i] = 255 * Math.min(1, v * 1.6);
      img.data[4 * i + 1] = 255 * Math.max(0, Math.min(1, v * 1.6 - 0.45));
      img.data[4 * i + 2] = 255 * Math.max(0, v * 2 - 1.4);
      img.data[4 * i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
}

// ---------- Dibujo ----------
function resetCanvas() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, draw.width, draw.height);
}
resetCanvas();

let drawing = false, last = null, dirty = false, hasInk = false;
function pos(e) {
  const r = draw.getBoundingClientRect();
  return { x: (e.clientX - r.left) * draw.width / r.width, y: (e.clientY - r.top) * draw.height / r.height };
}
function stroke(a, b) {
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = +thick.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  hasInk = true;
  dirty = true;
}
draw.addEventListener('pointerdown', e => {
  drawing = true;
  draw.setPointerCapture(e.pointerId);
  last = pos(e);
  stroke(last, last);
});
draw.addEventListener('pointermove', e => {
  if (!drawing) return;
  const p = pos(e);
  stroke(last, p);
  last = p;
});
['pointerup', 'pointercancel'].forEach(t => draw.addEventListener(t, () => { drawing = false; }));

function clearAll() {
  resetCanvas();
  hasInk = false;
  ctx28.fillStyle = '#000';
  ctx28.fillRect(0, 0, 28, 28);
  digitEl.textContent = '–';
  confEl.textContent = 'Dibuja un número para empezar.';
  bars.forEach(b => { b.fill.style.width = '0'; b.txt.textContent = '0,0 %'; b.row.classList.remove('top'); });
  paintMaps(maps1, new Float32Array(16 * 784), 28);
  paintMaps(maps2, new Float32Array(32 * 196), 14);
}
document.getElementById('clear').addEventListener('click', clearAll);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace') clearAll();
});

// ---------- Preprocesado ----------
// Escala FIJA: el lienzo de 280x280 se reduce siempre a 28x28 (factor 1/10),
// de modo que un trazo de 20 px de grosor queda en unos 2 px, como en MNIST.
// Solo se aplica una traslación (sin reescalar) para llevar el centro de masas
// del dígito al centro de la imagen (14,14), igual que se hizo con MNIST.
const tmp = document.createElement('canvas');
tmp.width = tmp.height = 28;
const tctx = tmp.getContext('2d', { willReadFrequently: true });
const mid = document.createElement('canvas');
mid.width = mid.height = 112;  // paso intermedio (1/2,5) para un antialiasing suave
const mctx = mid.getContext('2d');

function preprocess() {
  mctx.imageSmoothingEnabled = true; mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(draw, 0, 0, 112, 112);
  tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = 'high';
  tctx.fillStyle = '#000'; tctx.fillRect(0, 0, 28, 28);
  tctx.drawImage(mid, 0, 0, 28, 28);

  // Centro de masas
  let px = tctx.getImageData(0, 0, 28, 28).data;
  let m = 0, cx = 0, cy = 0;
  for (let y = 0; y < 28; y++)
    for (let x = 0; x < 28; x++) {
      const v = px[4 * (y * 28 + x)];
      m += v; cx += v * x; cy += v * y;
    }
  if (m === 0) return null;
  const sx = Math.round(13.5 - cx / m), sy = Math.round(13.5 - cy / m);

  // Desplazamiento entero (la escala no cambia)
  tctx.fillRect(0, 0, 28, 28);
  tctx.drawImage(mid, 0, 0, 112, 112, sx, sy, 28, 28);

  px = tctx.getImageData(0, 0, 28, 28).data;
  const x = new Float32Array(784);
  for (let i = 0; i < 784; i++) x[i] = px[4 * i] / 255;
  ctx28.putImageData(tctx.getImageData(0, 0, 28, 28), 0, 0);
  return x;
}

// ---------- Bucle de predicción ----------
function predict() {
  const x = preprocess();
  if (!x) return;
  const { probs, a1, a2 } = net.forward(x);
  let best = 0;
  for (let d = 1; d < 10; d++) if (probs[d] > probs[best]) best = d;
  digitEl.textContent = best;
  confEl.textContent = `Confianza: ${(probs[best] * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;
  bars.forEach((b, d) => {
    b.fill.style.width = (probs[d] * 100).toFixed(1) + '%';
    b.txt.textContent = (probs[d] * 100).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
    b.row.classList.toggle('top', d === best);
  });
  paintMaps(maps1, a1, 28);
  paintMaps(maps2, a2, 14);
}

function loop() {
  if (dirty && hasInk) { dirty = false; predict(); }
  requestAnimationFrame(loop);
}
clearAll();
loop();
