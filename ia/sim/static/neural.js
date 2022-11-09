console.log("NEURAL.JS LOADED");

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
        this.init();
    }

    init() {
        for (var i = 0; i < this.output_size; i++) {
            this.weights[i] = [];
            for (var j = 0; j < this.input_size; j++) {
                this.weights[i][j] = Math.random()-0.5;
            }
            this.bias[i] = Math.random()-0.5;
            this.output[i] = 0;
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

    train(input, target) {
        var delta = [];

        this.forward(input);

        // Output layer
        for (var i = 0; i < this.output.length; i++) {
            delta[i] = 2 * (target[i] - this.output[i]) * sigmoid_derivative(this.output[i]);
        }

        for (var i = this.layers.length - 1; i >= 0; i--) {            
            var weights = this.layers[i].get_weights();
            var bias = this.layers[i].get_bias();
            var new_delta = [];

            for (var j = 0; j < this.layers[i].input_size; j++) {
                var sum = 0;
                for (var k = 0; k < this.layers[i].output_size; k++) {
                    sum += weights[k][j] * delta[k];
                }
                if (i > 0) {
                    new_delta[j] = sum * sigmoid_derivative(this.layers[i-1].output[j]);
                } else {
                    new_delta[j] = sum * input[j];
                }
            }

            // Update weights
            for (var j = 0; j < this.layers[i].output_size; j++) {
                for (var k = 0; k < this.layers[i].input_size; k++) {
                    if (i > 0) {
                        weights[j][k] += this.learning_rate * delta[j] * this.layers[i-1].output[k];
                    } else {
                        weights[j][k] += this.learning_rate * delta[j] * input[k];
                    }                    
                }
                bias[j] += this.learning_rate * delta[j];
            }

            delta = new_delta;
        }
    }

    fit(data_x, data_y, epochs) {
        for (var j = 0; j < epochs; j++) {   
            for (var i = 0; i < data_x.length; i++) {
                this.train(data_x[i], data_y[i]);
            }
        }
    }

    predict(input) {
        this.forward(input);
        return this.output;
    }
}

//var net = new neuralnet([new layer(2,7), new layer(7,7), new layer(7,1)], 0.1);






        

        