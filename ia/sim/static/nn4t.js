
var w0 = Math.random();
var w1 = Math.random();
var w2 = Math.random();

//var x_data = [[-1,-1],[-0.5,1],[1,0],[1.5,1]];
//var y_data = [[0],[0],[1],[1]];

var x_data = [];
var y_data = [];


function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function sigmoid_derivative(x) {
    return x * (1 - x);
}

function train(x_data, y_data, epochs, learning_rate) {

    lr = learning_rate;

    for (var i = 0; i < epochs; i++) {
        var w0_d = 0;
        var w1_d = 0;
        var w2_d = 0;

        for (var j = 0; j < x_data.length; j++) {
            var x = x_data[j];
            var y = y_data[j];

            var o = sigmoid(w0 + w1 * x[0] + w2 * x[1]);

            var reg_step_1 = Math.pow(w0, 2) + Math.pow(w1, 2) + Math.pow(w2, 2);
            
            w0_d += 2*(o-y) * o * (1 - o)         + 0.01 * 0.5 * Math.pow(reg_step_1, -0.5) * 2 * w0;
            w1_d += 2*(o-y) * o * (1 - o) * x[0]  + 0.01 * 0.5 * Math.pow(reg_step_1, -0.5) * 2 * w1;
            w2_d += 2*(o-y) * o * (1 - o) * x[1]  + 0.01 * 0.5 * Math.pow(reg_step_1, -0.5) * 2 * w2;

        }

        w0 -= w0_d * lr;
        w1 -= w1_d * lr;
        w2 -= w2_d * lr;
    }

    return [w0, w1, w2];
}

function predict(x_data, weights) {
    var w0 = weights[0];
    var w1 = weights[1];
    var w2 = weights[2];

    var logit = w0 + w1 * x_data[0] + w2 * x_data[1];
    var o = sigmoid(logit);

    return [o, logit];
}
