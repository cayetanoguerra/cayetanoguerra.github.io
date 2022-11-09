var img = new Image();
//img.crossOrigin = 'anonymous';
//img.src = 'static/rhino.jpeg';

/*
img.onload = function() {
  draw(this);   
};
*/
var contador = 0;

function draw(img) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    //ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // This function takes an image from canvas and draws it to the canvas filling all pixels with a random color
    var fill_image = function() {
        var my_canvas = document.getElementById('canvas');
        var my_ctx = my_canvas.getContext('2d');
        var my_image = my_ctx.getImageData(0, 0, my_canvas.width, my_canvas.height);
        var my_data = my_image.data;
        var c1 = Math.random()*255;
        var c2 = Math.random()*255;
        var c3 = Math.random()*255;

        for (var i = 0; i < my_data.length; i += 4) {
            my_data[i] = c1;
            my_data[i + 1] = c2;
            my_data[i + 2] = Math.random()*255;
            my_data[i + 3] = 255;
        }
        my_ctx.putImageData(my_image, 0, 0);
    }
    

    canvas.addEventListener('mousemove', function(event) {
            const x = event.layerX;
            const y = event.layerY;

        fill_image();

        });
}

draw(img);