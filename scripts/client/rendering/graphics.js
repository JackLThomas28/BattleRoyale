// ------------------------------------------------------------------
//
// This is the graphics rendering code for the game.
//
// ------------------------------------------------------------------
MyGame.graphics = (function() {
    'use strict';

	var canvas = null,
		context = null,
		world = {
			size: 0,
			top: 0,
			left: 0
		},
		viewport = MyGame.components.Viewport({
			left: 0,
			top: 0,
			buffer: 0.15	// This can't really be any larger than world.buffer, guess I could protect against that.
		}),
		resizeHandlers = [];
	//------------------------------------------------------------------
	//
	// Used to set the size of the canvas to match the size of the browser
	// window so that the rendering stays pixel perfect.
	//
	//------------------------------------------------------------------
	function resizeCanvas() {
		var smallestSize = 0,
			handler = null;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		//
		// Have to figure out where the upper left corner of the unit world is
		// based on whether the width or height is the largest dimension.
		if (canvas.width < canvas.height) {
			smallestSize = canvas.width;
			world.size = smallestSize * 0.9;
			world.left = Math.floor(canvas.width * 0.05);
			world.top = (canvas.height - world.size) / 2;
		} else {
			smallestSize = canvas.height;
			world.size = smallestSize * 0.9;
			world.top = Math.floor(canvas.height * 0.05);
			world.left = (canvas.width - world.size) / 2;
		}

		//
		// Notify interested parties of the canvas resize event.
		for (handler in resizeHandlers) {
			resizeHandlers[handler](true);
		}
	}

	//------------------------------------------------------------------
	//
	// Quick to allow other code to be notified when a resize event occurs.
	//
	//------------------------------------------------------------------
	function notifyResize(handler) {
		resizeHandlers.push(handler);
	}

	//------------------------------------------------------------------
	//
	// Toggles the full-screen mode.  If not in full-screen, it enters
	// full-screen.  If in full screen, it exits full-screen.
	//
	//------------------------------------------------------------------
	function toggleFullScreen(element) {
		var	fullScreenElement = document.fullscreenElement ||
								document.webkitFullscreenElement ||
								document.mozFullScreenElement ||
								document.msFullscreenElement;

		element.requestFullScreen = element.requestFullScreen ||
									element.webkitRequestFullscreen ||
									element.mozRequestFullScreen ||
									element.msRequestFullscreen;
		document.exitFullscreen =	document.exitFullscreen ||
									document.webkitExitFullscreen ||
									document.mozCancelFullScreen ||
									document.msExitFullscreen;

		if (!fullScreenElement && element.requestFullScreen) {
			element.requestFullScreen();
		} else if (fullScreenElement) {
			document.exitFullscreen();
		}
    }

   	//------------------------------------------------------------------
	//
	// This provides initialization of the canvas.  From here the various
	// event listeners we care about are prepared, along with setting up
	// the canvas for rendering.
	//
	//------------------------------------------------------------------
	function initialize() {
		canvas = document.getElementById('canvas-main');
		context = canvas.getContext('2d');

		window.addEventListener('resize', function() {
			resizeCanvas();
		}, false);
		window.addEventListener('orientationchange', function() {
			resizeCanvas();
		}, false);
		window.addEventListener('deviceorientation', function() {
			resizeCanvas();
		}, false);

		//
		// Force the canvas to resize to the window first time in, otherwise
		// the canvas is a default we don't want.
		resizeCanvas();
    }

    //------------------------------------------------------------------
    //
    // Place a 'clear' function on the Canvas prototype, this makes it a part
    // of the canvas, rather than making a function that calls and does it.
    //
    //------------------------------------------------------------------
    CanvasRenderingContext2D.prototype.clear = function() {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, canvas.width, canvas.height);
        this.restore();
    };

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.clear();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through to save the canvas context.
    //
    //------------------------------------------------------------------
    function saveContext() {
        context.save();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through the restore the canvas context.
    //
    //------------------------------------------------------------------
    function restoreContext() {
        context.restore();
    }

	//------------------------------------------------------------------
	//
	// Perform a rotation of the canvas so that the next things rendered
	// will appear as rotated (after the canvas rotation is undone).
	//
	//------------------------------------------------------------------
	function rotateCanvas(center, rotation) {
		context.translate((center.x - viewport.left) * world.size + world.left,
			(center.y - viewport.top) * world.size + world.top);
		context.rotate(rotation);
		context.translate(-((center.x - viewport.left) * world.size + world.left), 
			-((center.y - viewport.top) * world.size + world.top));
	}

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImage() {
		var image = arguments[0],
			sx, sy,
			sWidth, sHeight,
			dx, dy,
			dWidth, dHeight,
			useViewport,
			model;

		//
        // Figure out which version of drawImage was called and extract the correct values
		if (arguments.length === 6 || arguments.length === 7) {
			sx = 0;
			sy = 0;
			sWidth = image.width;
			sHeight = image.height;
			dx = arguments[1];
			dy = arguments[2];
			dWidth = arguments[3];
			dHeight = arguments[4];
			model = arguments[5];
			useViewport = arguments[6];

		} else if (arguments.length === 9 || arguments.length === 10) {
			sx = arguments[1];
			sy = arguments[2];
			sWidth = arguments[3];
			sHeight = arguments[4];
			dx = arguments[5];
			dy = arguments[6];
			dWidth = arguments[7];
			dHeight = arguments[8];
			useViewport = arguments[9];
		}

		if (useViewport) {
			dx -= viewport.left;
			dy -= viewport.top;
		}

		let x = Math.floor(dx * world.size + world.left),
			y = Math.floor(dy * world.size + world.top),
			width = dWidth * world.size,
			height = dHeight * world.size;
		x = (model ? x - width / 2 : x);
		y = (model ? y - height / 2 : y);
		//
		// Convert from world to pixel coordinates on a few items.  Using
		// floor and ceil to prevent pixel boundary rendering issues.
		context.drawImage(
			image,
			sx, sy,
            sWidth, sHeight,
			x, y,
			width, height);
	}

    //------------------------------------------------------------------
    //
    // Draw an image out of a spritesheet into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImageSpriteSheet(spriteSheet, spriteSize, sprite, center, size) {
        let localCenter = {
            x: center.x * canvas.width,
            y: center.y * canvas.width
        };
        let localSize = {
            width: size.width * canvas.width,
            height: size.height * canvas.height
        };

        context.drawImage(spriteSheet,
            sprite * spriteSize.width, 0,           // which sprite to render
            spriteSize.width, spriteSize.height,    // size in the spritesheet
            localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width, localSize.height);
    }

	//------------------------------------------------------------------
	//
	// This returns the height of the specified font, in world units.
	//
	//------------------------------------------------------------------
	function measureTextHeight(spec) {
		var height = 0;
		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;

		height = context.measureText('m').width / world.size;

		context.restore();

		return height;
	}

	//------------------------------------------------------------------
	//
	// This returns the width of the specified font, in world units.
	//
	//------------------------------------------------------------------
	function measureTextWidth(spec) {
		var width = 0;
		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;

		width = context.measureText(spec.text).width / world.size;

		context.restore();

		return width;
	}

	//------------------------------------------------------------------
	//
	// Renders the text based on the provided spec.
	//
	//------------------------------------------------------------------
	function drawText(spec) {
		context.font = spec.font;
		context.fillStyle = spec.fill;
		context.textBaseline = 'top';
		context.strokeStyle = 'black';

		context.fillText(
			spec.text,
			world.left + spec.position.x * world.size,
			world.top + spec.position.y * world.size);
	}
	
	//------------------------------------------------------------------
	//
	// Draw a circle within the unit world.
	//
	//------------------------------------------------------------------
	function drawCircle(style, center, radius, useViewport) {
		var adjustLeft = (useViewport === true) ? viewport.left : 0,
			adjustTop = (useViewport === true) ? viewport.top : 0;

		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.strokeStyle = style;
		context.beginPath();
		context.arc(
			0.5 + world.left + ((center.x - adjustLeft) * world.size),
			0.5 + world.top + ((center.y - adjustTop) * world.size),
			radius * world.size,
			0, 2 * Math.PI);
		context.stroke();
	}

	//------------------------------------------------------------------
	//
	// Draw a filled circle within the unit world.
	//
	//------------------------------------------------------------------
	function drawFilledCircle(style, center, radius, useViewport) {
		var adjustLeft = (useViewport === true) ? viewport.left : 0,
			adjustTop = (useViewport === true) ? viewport.top : 0;

		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.fillStyle = style;
		context.beginPath();
		context.arc(
			0.5 + world.left + ((center.x - adjustLeft) * world.size),
			0.5 + world.top + ((center.y - adjustTop) * world.size),
			radius * world.size,
			0, 2 * Math.PI);
		context.fill();
	}	

	//------------------------------------------------------------------
	//
	// Draws a rectangle relative to the 'unit world'.
	//
	//------------------------------------------------------------------
	function drawRectangle(style, left, top, width, height, useViewport) {
		var adjustLeft = (useViewport === true) ? viewport.left : 0,
			adjustTop = (useViewport === true) ? viewport.top : 0;

		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.strokeStyle = style;
		context.strokeRect(
			0.5 + world.left + ((left - adjustLeft) * world.size),
			0.5 + world.top + ((top - adjustTop) * world.size),
			width * world.size,
			height * world.size);
	}
	
	//------------------------------------------------------------------
	//
	// Draws a filled rectangle relative to the 'unit world'.
	//
	//------------------------------------------------------------------
	function drawFilledRectangle(style, left, top, width, height, useViewport) {
		var adjustLeft = (useViewport === true) ? viewport.left : 0,
			adjustTop = (useViewport === true) ? viewport.top : 0;

		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.fillStyle = style;
		context.fillRect(
			0.5 + world.left + ((left - adjustLeft) * world.size),
			0.5 + world.top + ((top - adjustTop) * world.size),
			width * world.size,
			height * world.size);
	}

	return {
        initialize: initialize,
        clear: clear,
        saveContext: saveContext,
        restoreContext: restoreContext,
        rotateCanvas: rotateCanvas,
        drawImage: drawImage,
		drawImageSpriteSheet: drawImageSpriteSheet,
		drawText: drawText,
		drawCircle: drawCircle,
		drawFilledCircle: drawFilledCircle,
		drawRectangle: drawRectangle,
		drawFilledRectangle: drawFilledRectangle,
		notifyResize: notifyResize,
        get viewport() { return viewport; },
        get world() { return world; }
    };
}());
