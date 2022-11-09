
class OutputPanel
{
    constructor(data_x, data_y, canvas)
    {
        this.x_max = 2;
        this.x_min = -2;
        this.y_max = 2;
        this.y_min = -2;

        this.data_x = data_x;
        this.data_y = data_y;

        this.current_class = 0;

        this.canvas = document.getElementById(canvas);
        this.rect = this.canvas.getBoundingClientRect();
        this.ctx = this.canvas.getContext("2d");
        this.output_image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);    

        var self = this;
        this.canvas.addEventListener('mouseup', function(event) {
            var x = event.clientX - self.rect.left;
            var y = event.clientY - self.rect.top;

            self.data_x.push(self.canvas_to_nn(x, y));
            self.data_y.push([self.current_class]);
            
            self.draw();
            self.draw_points();
        });
       
    }

    set_class(c)
    {
        this.current_class = c;
    }


    canvas_to_nn(xc, yc)
    {
        var x = this.x_min + (this.x_max - this.x_min) * xc / this.canvas.width;
        var y = this.y_max - (this.y_max - this.y_min) * yc / this.canvas.height;
        return [x, y];
    }

    nn_to_canvas(x, y)
    {
        var xc = (x - this.x_min) * this.canvas.width / (this.x_max - this.x_min);
        var yc = (this.y_max - y) * this.canvas.height / (this.y_max - this.y_min);
        return [xc, yc];
    }

    draw()
    {
        var pixels = this.output_image.data;

        for (var i = 0; i < this.canvas.width; i++) {
            for (var j = 0; j < this.canvas.height; j++) {
                var index = (i + j * this.canvas.width) * 4;

                var xn = this.canvas_to_nn(i, j)[0];
                var yn = this.canvas_to_nn(i, j)[1];

                var p = net.predict([xn, yn]);
                if (draw_just_one_neuron == true) {
                    /*console.log("SOLO NEURONA");
                    console.log(draw_just_one_neuron_layer);
                    console.log(draw_just_one_neuron_output);*/
                    // p = net.layers[draw_just_one_neuron_layer].output[draw_just_one_neuron];
                    p = net.layers[0].output[draw_just_one_neuron_output];
                    //draw_just_one_neuron = false;
                } 
                
                

                if (p>0.45 && p<0.55) {
                    var mix = (p-0.5)*10;
                    mix = 1/(1+Math.exp(-mix*5));
                    mix = mix*(1-mix)*4;            

                    pixels[index] =     255 * mix + pixels[index] * (1-mix);
                    pixels[index + 1] = 255 * mix + pixels[index + 1] * (1-mix);
                    pixels[index + 2] = 255 * mix + pixels[index + 2] * (1-mix);
                }
                else{
                    pixels[index] = p*175 + (1-p)*255;
                    pixels[index + 1] = p*175 + (1-p)*175;   
                    pixels[index + 2] = p*255 + (1-p)*175;
                }
                pixels[index + 3] = 255;
            }
        }
        

        this.ctx.putImageData(this.output_image, 0, 0);
    }

    draw_points()
    {
        for (var i = 0; i < this.data_x.length; i++) {
            var x = this.data_x[i][0];
            var y = this.data_x[i][1];
            var c = this.data_y[i][0];

            if (c==0) {
                this.ctx.fillStyle = "rgb(255, 0, 0)";
            }
            else{
                this.ctx.fillStyle = "rgb(0, 0, 255)";
            }

            var xc = this.nn_to_canvas(x, y)[0];
            var yc = this.nn_to_canvas(x, y)[1];

            this.ctx.beginPath();
            this.ctx.arc(xc, yc, 5, 0, 2 * Math.PI, false);
            //this.ctx.fillStyle = 'rgb(0, 0, 0)';
            this.ctx.fill();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'rgb(0, 0, 0)';
            this.ctx.stroke();
        }
    }
}


