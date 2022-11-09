
class neuron_viz {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.canvas = document.getElementById("id_net");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    

    draw() {
        this.ctx.save();
        this.ctx.fillStyle = "#f5de9a";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, 15, 0, Math.PI*2, false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    draw_input() {
        this.ctx.save();
        this.ctx.fillStyle = "#000000";        
        this.ctx.beginPath();
        this.ctx.arc(this.x + 15, this.y, 5, 0, Math.PI*2, false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
}

class net_viz {
    constructor(layers) {
        this.half = 200;
        this.canvas = document.getElementById("id_net");
        this.ctx = this.canvas.getContext("2d");
        this.layers = layers;
        this.model = [];

        for (var i=0; i<this.layers.length; i++) {
            this.model.push([]);            
            var offset = this.half - (this.layers[i] * 45)/2;
            for (var j=0; j<layers[i]; j++) {
                this.model[i].push(new neuron_viz(60+90*i, offset + 45*j));                
            }
        }
        
        self = this;
        this.canvas.addEventListener('mousemove', 
            function(event) {
                
                const bounding = self.canvas.getBoundingClientRect();
                const x_m = event.clientX - bounding.left;
                const y_m = event.clientY - bounding.top;

                draw_just_one_neuron = false;
                for (var i=0; i<self.model.length; i++) {
                    for (var j=0; j<self.model[i].length; j++) {
                        if (Math.sqrt((x_m - self.model[i][j].x)**2 + (y_m - self.model[i][j].y)**2) < 15) {
                            console.log("------> en la capa " + i + " neurona " + j);
                            draw_just_one_neuron = true;
                            draw_just_one_neuron_layer = i;
                            draw_just_one_neuron_output = j;
                        }
                    }
                }
                //
            }
        );
    }

    draw() {
        for (var i=0; i<this.model.length-1; i++) {
            for (var j=0; j<this.model[i].length; j++) {                
                for (var k=0; k<this.model[i+1].length; k++) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.model[i][j].x+15, this.model[i][j].y);
                    this.ctx.lineTo(this.model[i+1][k].x, this.model[i+1][k].y);
                    this.ctx.stroke();
                    this.ctx.closePath();
                    this.ctx.restore();
                }
                if (i!=0) {
                    this.model[i][j].draw();                
                }
                else{
                    this.model[i][j].draw_input();
                }
            }
        }
        var last = this.model.length-1;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.model[last][0].x, this.model[last][0].y);
        this.ctx.lineTo(this.model[last][0].x+60, this.model[last][0].y);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
        this.model[this.model.length-1][0].draw();
    }
}

//var M = new net_viz([2, 5, 4, 1]);
//M.draw();







       