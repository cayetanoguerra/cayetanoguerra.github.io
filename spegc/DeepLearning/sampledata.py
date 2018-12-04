import numpy as np
import random


def create_data(samples):
    """
    :param samples: number of samples to create
    :return: tuple of two numpy lists containing data and labels
    """
    data = []
    label = []
    for i in range(samples):
        s1 = random.randint(0, 127)
        s2 = random.randint(0, 127)
        r = s1 + s2
        s1b = bin(s1)[2:].zfill(8)
        s2b = bin(s2)[2:].zfill(8)
        r = bin(r)[2:].zfill(8)
        seq_input = []
        lab = []
        for s1i, s2i, ri in zip(s1b, s2b, r):
            seq_input.append([float(s1i), float(s2i)])
            lab.append(float(ri))
        data.append(seq_input[::-1])
        label.append(lab[::-1])
    return np.asarray(data), np.asarray(label)
