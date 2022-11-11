class LossPanel
{
    constructor(canvas)
    {
        this._loss_values = [];
        this.canvas = document.getElementById(canvas);
        this.rect = this.canvas.getBoundingClientRect();
        this.ctx = this.canvas.getContext("2d");

        this.draw_axis();
        this.draw_numbered_scale();

        this.max_loss = 0;

    }

    update(loss_value)
    {
        if (loss_value > this.max_loss) {
            this.max_loss = loss_value;
        }
        this._loss_values.push(loss_value);
        this.draw();
    }

    draw_numbered_scale()
    {
        this.ctx.save();
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("0", 0, this.canvas.height);
        this.ctx.fillText("1", 0, 0);
        this.ctx.restore();
    }

    draw_axis()
    {
        this.ctx.save();
        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
        
    draw()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        
        if (this._loss_values.length > this.canvas.width - 50) {
            this._loss_values.shift();
            if (this.max_loss <= this._loss_values[0]) {
                this.max_loss = this._loss_values[1];
            }
        }
        this.ctx.moveTo(0, this.canvas.height - (this._loss_values[0] / this.max_loss) * this.canvas.height * 0.75 - 10);
        for (var i = 0; i < this._loss_values.length; i++) {
            this.ctx.lineTo(i, this.canvas.height - (this._loss_values[i] / this.max_loss) * this.canvas.height * 0.75 - 10);
            // this.ctx.lineTo(i, this.canvas.height - this._loss_values[i] * this.canvas.height * 2);
        }
        var last_x = this._loss_values.length - 1;
        var last_y = this.canvas.height - (this._loss_values[this._loss_values.length - 1] / this.max_loss) * this.canvas.height * 0.75 - 10;
        this.ctx.stroke();
        // Draw a small blue circle at the end of the line
        this.ctx.beginPath();
        this.ctx.fillStyle = "#a0a0a0";
        this.ctx.arc(last_x, last_y, 4, 1, Math.PI*2, false);
        this.ctx.fill();
        this.ctx.closePath();
        
        // Write the current loss value
        this.ctx.save();
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this._loss_values[this._loss_values.length - 1].toFixed(5), last_x + 20, last_y - 10);
        this.ctx.restore();

    }
}
