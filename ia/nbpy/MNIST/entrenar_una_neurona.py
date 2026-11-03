# Entrena UNA sola neurona (regresión logística) que distingue los "5" de los "7" de MNIST.
#   z = w·x + b        (784 pesos, uno por píxel, más un sesgo)
#   p = sigmoide(z)    (probabilidad de que sea un 7; 1 - p = probabilidad de que sea un 5)
# Solo necesita numpy. Uso: python entrenar_una_neurona.py <carpeta con los .gz de MNIST>
import gzip, json, sys
import numpy as np

rng = np.random.default_rng(0)
D = sys.argv[1] if len(sys.argv) > 1 else '.'

def imgs(f):
    with gzip.open(f) as g: return np.frombuffer(g.read(), np.uint8, offset=16).reshape(-1, 28, 28)
def labs(f):
    with gzip.open(f) as g: return np.frombuffer(g.read(), np.uint8, offset=8)

def subset(X, y):
    k = (y == 5) | (y == 7)
    return X[k].astype(np.float32) / 255., (y[k] == 7).astype(np.float32)   # 7 -> 1, 5 -> 0

Xtr, ytr = subset(imgs(f'{D}/train-images-idx3-ubyte.gz'), labs(f'{D}/train-labels-idx1-ubyte.gz'))
Xte, yte = subset(imgs(f'{D}/t10k-images-idx3-ubyte.gz'), labs(f'{D}/t10k-labels-idx1-ubyte.gz'))
print(f'entrenamiento: {len(ytr)} imágenes ({int(ytr.sum())} sietes, {int((1-ytr).sum())} cincos); test: {len(yte)}')

# Aumento de datos sencillo: pequeños desplazamientos y cambios de grosor del trazo,
# para que la neurona tolere mejor los dígitos dibujados en el navegador.
def dilate(x):
    p = np.pad(x, ((0, 0), (1, 1), (1, 1)))
    return np.max([p[:, 1 + dy:29 + dy, 1 + dx:29 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1)], 0)

def augment(x):
    x = x.copy()
    for i in range(len(x)):
        x[i] = np.roll(x[i], (rng.integers(-1, 2), rng.integers(-1, 2)), (0, 1))
    r = rng.random(len(x))
    x[r < .3] = dilate(x[r < .3])
    return x

sig = lambda z: 1 / (1 + np.exp(-z))
w = np.zeros(784, np.float32); b = 0.0
lam = 1e-2            # regularización L2: pesos más suaves e interpretables
lr, B, E = 0.05, 64, 30
mw, vw, mb, vb, t = np.zeros_like(w), np.zeros_like(w), 0., 0., 0   # Adam

for ep in range(E):
    perm = rng.permutation(len(ytr))
    for i in range(0, len(perm), B):
        idx = perm[i:i + B]
        x = augment(Xtr[idx]).reshape(len(idx), 784); y = ytr[idx]
        p = sig(x @ w + b)
        gw = x.T @ (p - y) / len(idx) + lam * w      # gradiente de la entropía cruzada
        gb = float(np.mean(p - y))
        t += 1
        mw = .9 * mw + .1 * gw; vw = .999 * vw + .001 * gw ** 2
        mb = .9 * mb + .1 * gb; vb = .999 * vb + .001 * gb ** 2
        w -= lr * (mw / (1 - .9 ** t)) / (np.sqrt(vw / (1 - .999 ** t)) + 1e-8)
        b -= lr * (mb / (1 - .9 ** t)) / (np.sqrt(vb / (1 - .999 ** t)) + 1e-8)
    lr *= 0.9
    acc = ((sig(Xte.reshape(-1, 784) @ w + b) > .5) == yte).mean()
    print(f'época {ep + 1:2d}: precisión test {acc * 100:.2f} %', flush=True)

json.dump({'w': [round(float(v), 5) for v in w], 'b': round(float(b), 5),
           'acc': round(float(acc) * 100, 2), 'ntrain': int(len(ytr)), 'ntest': int(len(yte))},
          open('neurona_5_7.json', 'w'))
print('pesos guardados en neurona_5_7.json')
