import gzip, numpy as np, torch, torch.nn as nn, torch.nn.functional as F, json, base64, time, sys
torch.manual_seed(0); np.random.seed(0)
torch.set_num_threads(2)
D = sys.argv[1]

def imgs(f):
    with gzip.open(f) as g: return np.frombuffer(g.read(), np.uint8, offset=16).reshape(-1, 1, 28, 28)
def labs(f):
    with gzip.open(f) as g: return np.frombuffer(g.read(), np.uint8, offset=8)

Xtr = torch.tensor(imgs(f'{D}/train-images-idx3-ubyte.gz'), dtype=torch.float32) / 255.
ytr = torch.tensor(labs(f'{D}/train-labels-idx1-ubyte.gz'), dtype=torch.long)
Xte = torch.tensor(imgs(f'{D}/t10k-images-idx3-ubyte.gz'), dtype=torch.float32) / 255.
yte = torch.tensor(labs(f'{D}/t10k-labels-idx1-ubyte.gz'), dtype=torch.long)

class Net(nn.Module):
    def __init__(s):
        super().__init__()
        s.c1 = nn.Conv2d(1, 16, 3, padding=1)   # 28x28x16 -> pool 14x14
        s.c2 = nn.Conv2d(16, 32, 3, padding=1)  # 14x14x32 -> pool 7x7
        s.f1 = nn.Linear(32 * 7 * 7, 128)
        s.f2 = nn.Linear(128, 10)
    def forward(s, x):
        x = F.max_pool2d(F.relu(s.c1(x)), 2)
        x = F.max_pool2d(F.relu(s.c2(x)), 2)
        x = F.dropout(F.relu(s.f1(x.flatten(1))), 0.3, s.training)
        return s.f2(x)

def augment(x):
    n = x.shape[0]
    ang = (torch.rand(n) - .5) * 2 * np.radians(15)
    sc = 1 + (torch.rand(n) - .5) * 0.3
    sh = (torch.rand(n) - .5) * 0.3
    tx, ty = (torch.rand(n) - .5) * 0.2, (torch.rand(n) - .5) * 0.2
    c, s_ = torch.cos(ang) / sc, torch.sin(ang) / sc
    th = torch.stack([torch.stack([c, -s_ + sh, tx], 1), torch.stack([s_, c, ty], 1)], 1)
    g = F.affine_grid(th, x.shape, align_corners=False)
    x = F.grid_sample(x, g, align_corners=False)
    # random stroke thickness: dilate or erode some samples
    r = torch.rand(n, 1, 1, 1)
    dil = F.max_pool2d(x, 3, 1, 1); ero = -F.max_pool2d(-x, 3, 1, 1)
    x = torch.where(r < .2, dil, torch.where(r > .9, ero, x))
    return x

m = Net(); opt = torch.optim.Adam(m.parameters(), 1e-3)
E = 12
sched = torch.optim.lr_scheduler.OneCycleLR(opt, 3e-3, total_steps=E * (60000 // 128 + 1))
for ep in range(E):
    m.train(); t = time.time(); perm = torch.randperm(60000)
    for i in range(0, 60000, 128):
        idx = perm[i:i + 128]
        loss = F.cross_entropy(m(augment(Xtr[idx])), ytr[idx])
        opt.zero_grad(); loss.backward(); opt.step(); sched.step()
    m.eval()
    with torch.no_grad(): acc = (m(Xte).argmax(1) == yte).float().mean().item()
    print(f'epoch {ep+1}: test acc {acc*100:.2f}%  ({time.time()-t:.0f}s)', flush=True)

# export weights as base64 float32 in a JS file
out = {}
for k, v in m.state_dict().items():
    a = v.numpy().astype('<f4')
    out[k] = {'shape': list(a.shape), 'data': base64.b64encode(a.tobytes()).decode()}
with open('weights.js', 'w') as f:
    f.write('// Pesos de la CNN entrenada con MNIST (float32 en base64). Precisión test: %.2f%%\n' % (acc * 100))
    f.write('const MNIST_WEIGHTS = ' + json.dumps(out) + ';\n')
# a few test samples for verifying the JS implementation
torch.save({'x': Xte[:200], 'logits': m(Xte[:200]).detach()}, 'check.pt')
np.save('check_x.npy', Xte[:200].numpy()); np.save('check_logits.npy', m(Xte[:200]).detach().numpy())
print('done', acc)
