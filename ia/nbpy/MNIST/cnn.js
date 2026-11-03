// Inferencia de la CNN en JavaScript puro (sin librerías).
// Los pesos vienen de PyTorch: conv [out, in, kh, kw], lineal [out, in], aplanado en orden C,H,W.

function decodeTensor(t) {
  const bin = atob(t.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { shape: t.shape, data: new Float32Array(bytes.buffer) };
}

// Convolución 2D con padding 1 y kernel 3x3 (stride 1), seguida de ReLU.
function conv3x3Relu(input, C, H, W, weight, bias) {
  const O = weight.shape[0];
  const w = weight.data, b = bias.data;
  const out = new Float32Array(O * H * W);
  for (let o = 0; o < O; o++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let s = b[o];
        for (let c = 0; c < C; c++) {
          const wBase = ((o * C + c) * 3) * 3;
          const iBase = c * H * W;
          for (let ky = 0; ky < 3; ky++) {
            const yy = y + ky - 1;
            if (yy < 0 || yy >= H) continue;
            for (let kx = 0; kx < 3; kx++) {
              const xx = x + kx - 1;
              if (xx < 0 || xx >= W) continue;
              s += input[iBase + yy * W + xx] * w[wBase + ky * 3 + kx];
            }
          }
        }
        out[(o * H + y) * W + x] = s > 0 ? s : 0;
      }
    }
  }
  return out;
}

// Max-pooling 2x2 con stride 2.
function maxPool2(input, C, H, W) {
  const h = H >> 1, w = W >> 1;
  const out = new Float32Array(C * h * w);
  for (let c = 0; c < C; c++)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = c * H * W + 2 * y * W + 2 * x;
        out[(c * h + y) * w + x] = Math.max(input[i], input[i + 1], input[i + W], input[i + W + 1]);
      }
  return out;
}

// Capa densa: y = W x + b (con ReLU opcional).
function dense(input, weight, bias, relu) {
  const [O, I] = weight.shape;
  const w = weight.data, b = bias.data;
  const out = new Float32Array(O);
  for (let o = 0; o < O; o++) {
    let s = b[o];
    const base = o * I;
    for (let i = 0; i < I; i++) s += w[base + i] * input[i];
    out[o] = relu && s < 0 ? 0 : s;
  }
  return out;
}

function softmax(z) {
  const m = Math.max(...z);
  const e = Array.from(z, v => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / s);
}

class CNN {
  constructor(raw) {
    this.p = {};
    for (const k in raw) this.p[k] = decodeTensor(raw[k]);
    this.nParams = Object.values(this.p).reduce((a, t) => a + t.data.length, 0);
  }
  // x: Float32Array(784) con valores en [0,1] (fondo 0, trazo 1).
  forward(x) {
    const p = this.p;
    const a1 = conv3x3Relu(x, 1, 28, 28, p['c1.weight'], p['c1.bias']);   // 16x28x28
    const p1 = maxPool2(a1, 16, 28, 28);                                   // 16x14x14
    const a2 = conv3x3Relu(p1, 16, 14, 14, p['c2.weight'], p['c2.bias']);  // 32x14x14
    const p2 = maxPool2(a2, 32, 14, 14);                                   // 32x7x7
    const h = dense(p2, p['f1.weight'], p['f1.bias'], true);               // 128
    const logits = dense(h, p['f2.weight'], p['f2.bias'], false);         // 10
    return { logits, probs: softmax(logits), a1, a2 };
  }
}
