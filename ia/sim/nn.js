// Create a raster item using the image tag with id='mona'
var raster = new Raster('mona.png');

// Move the raster to the center of the view
raster.position = view.center;

// Create a circle shaped path at {x: 50, y: 50}
// with a radius of 30:
var path = new Path.Circle({
	center: [50, 50],
	radius: 30,
	strokeColor: 'white'
});

function onMouseMove(event) {
	// Set the fill color of the path to the average color
	// of the raster at the position of the mouse:
	path.fillColor = raster.getAverageColor(event.point);
}