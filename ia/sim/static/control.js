var data_x = [];
var data_y = [];

var training = false;
var timeoutID = 0;
var draw_just_one_neuron = false;
var draw_just_one_neuron_layer = -1;
var draw_just_one_neuron_output = -1;


function create_viz_network(layers)
{
    var model = [];
    
    for (var i=0; i<layers.length-1; i++) {
        model.push(new layer(layers[i], layers[i+1]));
    }    

    // var net = new neuralnet([new layer(2,7), new layer(7,7), new layer(7,1)], 0.1);
    var net = new neuralnet(model, 0.1);

    var M = new net_viz(layers);
    M.draw();
    return net;
}


function drawing()
{
    net.fit(data_x, data_y, 10);
    output_panel.draw();
    output_panel.draw_points();
}

function training_on_off()
{
    if (training) {
        training = false;
        document.getElementById("id_training").innerHTML = "Start training";
        clearInterval(timeoutID);
    }
    else{
        training = true;
        document.getElementById("id_training").innerHTML = "Stop training";
        timeoutID = setInterval(drawing, 100);
    }
}

function change_viz_network()
{
    
    var value1 = document.getElementById("id_hidden_layer_1").value;
    var value2 = document.getElementById("id_hidden_layer_2").value;
    console.log(value1);
    console.log(value2);
    net = create_viz_network([2, value1, value2, 1]);

    output_panel = new OutputPanel(data_x, data_y, "id_canvas");
    output_panel.draw();
    output_panel.draw_points();
}

var net = create_viz_network([2, 5, 5, 1]);
var output_panel = new OutputPanel(data_x, data_y, "id_canvas");
output_panel.draw()
