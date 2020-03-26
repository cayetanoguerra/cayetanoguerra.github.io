#
#   Neural Nets for Teaching
#
#   Cayetano Guerra Artal (c) 2016
#
#


import numpy as np


# Translate a list of labels into an array of 0's and one 1.
# i.e.: 4 -> [0,0,0,0,1,0,0,0,0,0]
def one_hot(x, n):
    if type(x) == list:
        x = np.array(x)
    x = x.flatten()
    o_h = np.zeros((len(x), n))
    o_h[np.arange(len(x)), x] = 1
    return o_h


#
# Sigmoid
#
def sigmoid(x):
    return 1.0/(1.0 + np.exp(-x))


def sigmoid_derivate(o):
    return o * (1.0 - o)


#
# Rectified Linear Unit
#
def relu(x):
    if x >= 0.:
        return x
    else:
        return 0.


def relu_derivate(o):
    if o >= 0.:
        return 1.
    else:
        return 0.


#
# Identity
#
def identity(x):
    return x


def identity_derivate():
    return 1.


#
# TanH
#
def tanh(x):
    return 2./(1. + np.exp(-2. * x)) - 1.


def tanh_derivate(o):
    return 1. - o**2.


activ_f = {
    "Sigmoid": (sigmoid, sigmoid_derivate),
    "ReLU": (relu, relu_derivate),
    "Identity": (identity, identity_derivate),
    "TanH": (tanh, tanh_derivate)
}


class Layer:
    """ Layer
    """

    def __init__(self, rows, columns, activ_f=activ_f["Sigmoid"]):
        self.rows = rows
        self.columns = columns + 1  # One column for bias
        self.W = Layer.create_W(self.rows, self.columns)
        self.W_delta = []
        self.b_delta = []
        self.activ_f = activ_f[0]
        self.o_activ_f_derivate = activ_f[1]
        self.error = []
        self.o = None

    @staticmethod
    def create_W(rows, columns):
        return np.random.rand(rows, columns) * 0.1

    def output(self, x):
        x = np.append(x, 1.0)
        self.o = self.activ_f(np.dot(self.W, x))
        self.o_derivate = self.o_activ_f_derivate(self.o)
        return self.o

    def __str__(self):
        return "Layer_____________\n     #inputs:" + repr(self.columns-1) + "\n     #neurons: " + repr(self.rows)


class Net:
    """ Net
    """

    def __init__(self, layers):
        self.layers = []
        l_prev = layers[0]
        for l in layers[1:]:
            self.layers.append(Layer(l, l_prev))
            l_prev = l
        self.number_of_layers = len(self.layers)

    def output(self, x):
        o_aux = x
        for layer in self.layers:
            o_aux = layer.output(o_aux)
        return o_aux
                       
    def train(self, input_data, labels, lr=0.1):
        for x, _y in zip(input_data, labels):
            y = self.output(x)
            error = y - _y
            for index_layer in range(self.number_of_layers)[:0:-1]:
                error = error * self.layers[index_layer].o_derivate
                self.layers[index_layer].W_delta = np.dot(error.reshape((len(error), 1)),
                                                          (np.append(self.layers[index_layer-1].o, 1.0))
                                                          .reshape(1, len(self.layers[index_layer-1].o)+1))
                error = np.dot(error, self.layers[index_layer].W[:, 0:-1])

            error = error * self.layers[0].o_derivate
            self.layers[0].W_delta = np.dot(error.reshape((len(error), 1)), np.append(x, 1.0).reshape((1, len(x)+1)))

            for index_layer in range(self.number_of_layers):
                self.layers[index_layer].W -= self.layers[index_layer].W_delta * lr