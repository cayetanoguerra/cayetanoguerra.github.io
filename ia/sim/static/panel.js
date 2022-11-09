
var x_min = -2;
var x_max = 2;
var y_min = -2;
var y_max = 2;

var weights = [w0, w1, w2];

var current_class = 0;

var training = false;

// Receive canvas coordinates and return the corresponding x and y values
function canvas_to_nn(xc, yc) { // x canvas, y canvas
    var x = x_min + (x_max - x_min) * xc / canvas.width;
    var y = y_max - (y_max - y_min) * yc / canvas.height;
    return [x, y];
}

function nn_to_canvas(x, y) {
    var xc = (x - x_min) * canvas.width / (x_max - x_min);
    var yc = (y_max - y) * canvas.height / (y_max - y_min);
    return [xc, yc];
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canvas_sigmoid = document.getElementById('canvas_sigmoid');
var ctx_sigmoid = canvas_sigmoid.getContext('2d');


const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;


// This function takes an image from canvas and draws it to the canvas filling all pixels with a random color
var fill_image = function() {
    var my_canvas = document.getElementById('canvas');
    var my_ctx = my_canvas.getContext('2d');
    var my_image = my_ctx.getImageData(0, 0, my_canvas.width, my_canvas.height);
    var my_data = my_image.data;

    /*var c1 = Math.random()*255;
    var c2 = Math.random()*255;
    var c3 = Math.random()*255;*/

    for (var i = 0; i < canvas.width; i++) {
        for (var j = 0; j < canvas.height; j++) {
            
            xn = canvas_to_nn(i, j)[0];
            yn = canvas_to_nn(i, j)[1];

            var prediction = predict([xn, yn], weights)[0];

            var index = (i + j * canvas.width) * 4;
            
            p = prediction;
            
            my_data[index] = (1-p)*175 + p*255;
            my_data[index + 1] = (1-p)*175 + p*175;   
            my_data[index + 2] = (1-p)*255 + p*175;

            if (p>0.45 && p<0.55) {
                mix = (p-0.5)*10;
                mix = 1/(1+Math.exp(-mix*5));
                mix = mix*(1-mix)*4;            

                my_data[index] =     255 * mix + my_data[index] * (1-mix);
                my_data[index + 1] = 255 * mix + my_data[index + 1] * (1-mix);
                my_data[index + 2] = 255 * mix + my_data[index + 2] * (1-mix);
            }

            my_data[index + 3] = 255;
        }
    }

    my_ctx.putImageData(my_image, 0, 0);
}


function paint() {
    if (training) {
        weights = train(x_data, y_data, 10, 0.1);
    }

    fill_image();

    for (var i = 0; i < x_data.length; i++) {
        drawPoint(x_data[i], y_data[i]);
    }

    document.getElementById('w0').innerHTML = "Θ = " + weights[0].toFixed(2);
    document.getElementById('w1').innerHTML = "w1 = " + weights[1].toFixed(2);
    document.getElementById('w2').innerHTML = "w2 = " + weights[2].toFixed(2);
}


canvas.addEventListener('mouseup', function(event) {
    var rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    x_data.push(canvas_to_nn(x, y));
    y_data.push([current_class]);

    document.getElementById('y_hat').innerHTML = "";
    document.getElementById('logit').innerHTML = "";

    paint();

});


function drawPoint(x, y) {
    xc = nn_to_canvas(x[0], x[1])[0];
    yc = nn_to_canvas(x[0], x[1])[1];
    ctx.beginPath();
    ctx.arc(xc, yc, 5, 0, 2 * Math.PI);
    if (y[0] == 0) {
        ctx.fillStyle = '#5050ff';
    } else {
        ctx.fillStyle = '#ff5050';
    }
    ctx.fill();
}

//Function check if radio button is checked
function checkRadio() {    
    var radio = document.getElementsByName('class_selector');
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
            current_class = i;
            break;
        }
    }
}

// add event on radio button
var radio = document.getElementsByName('class_selector');
for (var i = 0; i < radio.length; i++) {
    radio[i].addEventListener('click', checkRadio);
}

// event to show coordinates of the canvas in a floating div text
canvas.addEventListener('mousemove', function(event) {
    var rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    xn = canvas_to_nn(x, y)[0];
    yn = canvas_to_nn(x, y)[1];
    document.getElementById('x1').innerHTML = "e1 = " + xn.toFixed(2);
    document.getElementById('x2').innerHTML = "e2 = " + yn.toFixed(2);

    var prediction = predict([xn, yn], weights);
    document.getElementById('y_hat').innerHTML = prediction[0].toFixed(2);
    document.getElementById('logit').innerHTML = prediction[1].toFixed(2);

    // Draw vertical line in the sigmoid canvas
    paint_sigmoid();
    
    ctx_sigmoid.beginPath();
    ctx_sigmoid.moveTo(prediction[1]/7 *canvas_sigmoid.width/2 + canvas_sigmoid.width/2, 0);
    ctx_sigmoid.lineTo(prediction[1]/7 *canvas_sigmoid.width/2 + canvas_sigmoid.width/2, canvas_sigmoid.height);
    ctx_sigmoid.strokeStyle = 'black';
    ctx_sigmoid.stroke();

    // Draw text in the sigmoid canvas
    ctx_sigmoid.font = "12px Arial";
    ctx_sigmoid.fillStyle = "black";
    ctx_sigmoid.fillText("Predicción = " + prediction[0].toFixed(2), prediction[1]/7 *canvas_sigmoid.width/2 + canvas_sigmoid.width/2 + 5, 15);
    ctx_sigmoid.fillText("logit = " + prediction[1].toFixed(2), prediction[1]/7 *canvas_sigmoid.width/2 + canvas_sigmoid.width/2 + 5, 150);


});

function paint_sigmoid(){
    var x_inf = -7;
    var x_sup = 7;
    var y_inf = -1;
    var y_sup = 2;

    ctx_sigmoid.clearRect(0, 0, canvas_sigmoid.width, canvas_sigmoid.height);
    ctx_sigmoid.beginPath();
    ctx_sigmoid.moveTo(0, canvas_sigmoid.height);

    var step = (x_sup - x_inf)/canvas_sigmoid.width;
    var current_x = x_inf;
    var start = true;
    for (var i = 0; i < canvas_sigmoid.width; i++) {
        var y = 1/(1+Math.exp(-current_x));
        current_x += step;
        j = canvas_sigmoid.height - (y - y_inf)/(y_sup - y_inf)*canvas_sigmoid.height;
        if (start) {
            ctx_sigmoid.moveTo(i, j);
            start = false;
        } else {
            ctx_sigmoid.lineTo(i, j);
        }
    }
    ctx_sigmoid.clearRect(0, 0, canvas_sigmoid.width, canvas_sigmoid.height);
    ctx_sigmoid.strokeStyle = '#A0A0A0';
    ctx_sigmoid.stroke();
    // Draw horizontal line
    ctx_sigmoid.beginPath();
    ctx_sigmoid.moveTo(0, 2 * canvas_sigmoid.height/3);
    ctx_sigmoid.lineTo(canvas_sigmoid.width, 2 * canvas_sigmoid.height/3);
    //ctx_sigmoid.strokeStyle = '#A0A0A0';
    ctx_sigmoid.stroke();
    // Draw vertical line
    ctx_sigmoid.beginPath();
    ctx_sigmoid.moveTo(canvas_sigmoid.width/2, 0);
    ctx_sigmoid.lineTo(canvas_sigmoid.width/2, canvas_sigmoid.height);
    // Gray color
    //ctx_sigmoid.strokeStyle = '#A0A0A0';
    ctx_sigmoid.stroke();
    // Draw dotted line
    ctx_sigmoid.beginPath();
    ctx_sigmoid.setLineDash([5, 5]);
    ctx_sigmoid.moveTo(0, canvas_sigmoid.height/3);
    ctx_sigmoid.lineTo(canvas_sigmoid.width, canvas_sigmoid.height/3);
    //ctx_sigmoid.strokeStyle = '#A0A0A0';
    ctx_sigmoid.stroke();
    ctx_sigmoid.setLineDash([]);
    

}

function training_on_off() {
    if (training) {
        training = false;
        document.getElementById('train').innerHTML = "Entrenar";
    } else {
        training = true;
        document.getElementById('train').innerHTML = "Detener";
        timeoutID = setInterval(paint, 100)
    }
}

function delete_all() {
    training = false;
    x_data = [];
    y_data = [];
    document.getElementById('train').innerHTML = "Entrenar";
    paint();
}

paint();
paint_sigmoid();








    
