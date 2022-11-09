
var data_x = [[-1,-1],[-0.5,1],[1,0],[1.5,1]];
var data_y = [[0],[0],[1],[1]];


// Neural net layer

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function sigmoid_derivative(x) {
    return x * (1 - x);
}


class layer {
    constructor (input_size, output_size) {
        this.input_size = input_size;
        this.output_size = output_size;
        this.weights = [];
        this.bias = [];
        this.output = [];
        this.delta = [];
        this.init();
    }

    init() {
        for (var i = 0; i < this.output_size; i++) {
            this.weights[i] = [];
            for (var j = 0; j < this.input_size; j++) {
                this.weights[i][j] = Math.random();
            }
            this.bias[i] = Math.random();
            this.output[i] = 0;
            this.delta[i] = 0;
        }
    }

    forward(input) {
        for (var i = 0; i < this.output_size; i++) {
            var sum = 0;
            for (var j = 0; j < this.input_size; j++) {
                sum += this.weights[i][j] * input[j];
            }
            sum += this.bias[i];
            this.output[i] = sigmoid(sum);
        }
    }

    backward(input, delta) {
        for (var i = 0; i < this.input_size; i++) {
            var sum = 0;
            for (var j = 0; j < this.output_size; j++) {
                sum += this.weights[j][i] * delta[j];
            }
            this.delta[i] = sum * sigmoid_derivative(input[i]);
        }
    }

    update(learning_rate) {
        for (var i = 0; i < this.output_size; i++) {
            for (var j = 0; j < this.input_size; j++) {
                this.weights[i][j] -= learning_rate * this.delta[i] * this.output[j];
            }
            this.bias[i] -= learning_rate * this.delta[i];
        }
    }

    get_output() {
        return this.output;
    }

    get_weights() {
        return this.weights;
    }

    get_bias() {
        return this.bias;
    }

    get_delta() {
        return this.delta;
    }
}


class neuralnet {
    constructor (layers, learning_rate) {
        this.layers = layers;
        this.learning_rate = learning_rate;
        this.output = [];
    }

    forward(input) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].forward(input);
            input = this.layers[i].get_output();
        }
        this.output = input;
    }

    backward(target) {
        var delta = [];
        for (var i = 0; i < this.output.length; i++) {
            delta[i] = (target[i] - this.output[i]) * sigmoid_derivative(this.output[i]);
        }
        for (var i = this.layers.length - 1; i >= 0; i--) {
            this.layers[i].update(this.learning_rate);
            this.layers[i].backward(this.layers[i].get_output(), delta);
            delta = this.layers[i].get_delta();
        }
    }

    get_output() {
        return this.output;
    }

    train(input, target) {
        this.forward(input);
        this.backward(target);
    }
}

// Training

var net = new neuralnet([new layer(2, 3), new layer(3, 1)], 0.1);

for (var i = 0; i < 10000; i++) {
    for (var j = 0; j < data_x.length; j++) {
        net.train(data_x[j], data_y[j]);
    }
}

// Testing

for (var i = 0; i < data_x.length; i++) {
    net.forward(data_x[i]);
    console.log(net.get_output());
}


        