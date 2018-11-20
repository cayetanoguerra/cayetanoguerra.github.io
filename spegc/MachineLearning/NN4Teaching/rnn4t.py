#
#   Recursive Neural Nets for Teaching
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


class RHiddenLayer:
    """ Layer
    """

    W_hidden = []  # Static variable

    def __init__(self, inputs, hidden, activ_f=activ_f["TanH"]):
        self.rows = hidden
        self.columns = self.rows + inputs + 1  # One column for bias
        if len(RHiddenLayer.W_hidden) is 0:
            RHiddenLayer.W_hidden = RHiddenLayer.create_W(self.rows, self.columns)
        self.W = RHiddenLayer.W_hidden
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
        self.o = self.activ_f(np.dot(self.W_hidden, x))
        self.o_derivate = self.o_activ_f_derivate(self.o)
        return self.o

    def __str__(self):
        return "Layer_____________\n     #inputs:" + repr(self.columns-1) + "\n     #neurons: " + repr(self.rows)


class ROutputLayer:
    """ Layer
    """

    def __init__(self, rows, columns, activ_f=activ_f["Sigmoid"]):
        self.rows = rows
        self.columns = columns + 1  # One column for bias
        self.W = ROutputLayer.create_W(self.rows, self.columns)
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


class RNet:
    """ Net
    """

    def __init__(self, layers, rollback_steps=10):
        if len(layers) != 3:
            print "Layers should be: [# of inputs, # hidden neurons, # output neurons]"
        self.layers = []
        self.rollback_steps = rollback_steps
        self.number_of_inputs = layers[0]
        self.number_of_hidden = layers[1]
        self.number_of_outputs = layers[2]
        for _ in range(self.rollback_steps):
            self.layers.append(RHiddenLayer(self.number_of_inputs, self.number_of_hidden))
        self.layers.append(ROutputLayer(self.number_of_outputs, self.number_of_hidden))
        self.number_of_layers = len(self.layers)

    def output(self, x):
        if len(x) != self.rollback_steps:
            print "Rollback steps and lenght of inputs must match."
            raise  # implement exception
        i = 0
        o_aux = np.zeros(self.number_of_hidden)
        for layer in self.layers:
            if isinstance(layer, RHiddenLayer):
                o_aux = np.append(o_aux, x[i])
                o_aux = np.append(o_aux, 1.)
                o_aux = layer.output(o_aux)
                i += 1
            else:
                o_aux = layer.output(o_aux)
        return o_aux

    def train(self, input_data, labels, lr=0.1):
        training_error = 0.
        for j in range(len(input_data)):
            x = input_data[j]
            _y = labels[j]
            y = self.output(x)
            error = y - _y

            training_error += np.sum(np.abs(error))

            error = error * self.layers[-1].o_derivate
            self.layers[-1].W_delta = np.dot(error.reshape((len(error), 1)),
                                                          (np.append(self.layers[-2].o, 1.0))
                                                          .reshape(1, len(self.layers[-2].o)+1))
            error = np.dot(error, self.layers[-1].W[:, 0:-1])

            for index_layer in range(self.number_of_layers)[-2:0:-1]:
                error = error * self.layers[index_layer].o_derivate
                inputs_in_layer = np.append(self.layers[index_layer-1].o, np.append(x[index_layer], 1.0))
                self.layers[index_layer].W_delta = np.dot(error.reshape((len(error), 1)),
                                                          inputs_in_layer
                                                          .reshape(1, len(inputs_in_layer)))
                error = np.dot(error, self.layers[index_layer].W[:, 0:-(self.number_of_inputs+1)])

            #error = error * self.layers[0].o_derivate
            #self.layers[0].W_delta = np.dot(error.reshape((len(error), 1)), np.append(x, 1.0).reshape((1, len(x)+1)))

            W_delta = np.zeros_like(self.layers[-2].W_delta)

            for layer in self.layers[1:-2]:
                W_delta += layer.W_delta

            RHiddenLayer.W_hidden -= W_delta

            self.layers[-1].W -= self.layers[-1].W_delta * lr

        return training_error

