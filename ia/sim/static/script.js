// Create a Paper.js Path to draw a line into it:
var path = new Path();
path.strokeColor = 'black';
var start = new Point(100, 100);
path.moveTo(start);

// Use the global variables a and b defined in the JavaScript
path.lineTo(start + [ globals.a, globals.b ]);

// Define a global function inside the window scope.
globals.lineTo2 = function(c,d) {
    path.lineTo(new Point(c, d));
}


// Create a raster item using the image tag with id='mona'
// var raster = new Raster('static/mona.png');
/*
raster.on('load', function() {
	// Downsize the pixel content to 80 pixels wide and 60 pixels high:
	raster.size = new Size(80, 60);
});
*/

//var raster = new Raster();
var raster = new Raster({
    size: {
        width: 40,
        height: 30
    }
});

// Hide the raster:
raster.visible = true;

// The size of our grid cells:
var gridSize = 6;

// Space the cells by 120%:
var spacing = 1.2;


function fill_space(){
    for (var y = 0; y < raster.height; y++) {
        for(var x = 0; x < raster.width; x++) {
            // Get the color of the pixel:
            var color = raster.getPixel(x, y);
            raster.setPixel(x, y, "#ffff00");
    
            // Create a circle shaped path:
            var path = new Path.Circle({
                center: new Point(x, y) * gridSize,
                radius: gridSize / 2 / spacing
            });
    
            // Set the fill color of the path to the color
            // of the pixel:
            path.fillColor = '#ff00f0';
        }
    }
}

globals.fill_space2 = function() {
    fill_space();
}

