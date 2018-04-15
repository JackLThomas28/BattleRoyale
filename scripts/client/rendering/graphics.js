// ------------------------------------------------------------------
//
// This is the graphics rendering code for the game.
//
// ------------------------------------------------------------------
MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d');
    let world = {
        size: 0,
		top: 0,
		left: 0
    };
    let viewport = MyGame.components.Viewport({
        left: 0.0,
        top: 0.0,
        buffer: 0.15	// This can't really be any larger than world.buffer, guess I could protect against that.
    });
    let resizeHandlers = [];
    
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
    // Rotate the canvas to prepare it for rendering of a rotated object.
    //
    //------------------------------------------------------------------
    function rotateCanvas(center, rotation) {
        context.translate(center.x * canvas.width, center.y * canvas.width);
        context.rotate(rotation);
        context.translate(-center.x * canvas.width, -center.y * canvas.width);
    }

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImage(texture, center, size) {
        let localCenter = {
            x: center.x * canvas.width,
            y: center.y * canvas.width
        };
        let localSize = {
            width: size.width * canvas.width,
            height: size.height * canvas.height
        };

        context.drawImage(texture,
            localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width,
            localSize.height);
    }

    //------------------------------------------------------------------
    //
    // Draw an image out of a spritesheet into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImageSpriteSheet(spriteSheet, spriteSize, sprite, center, size) {
        let localCenter = {
            x: center.x * canvas.width,
            y: center.y * canvas.height
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

    function drawImageTileSet() {
        var image = arguments[0],
        sx, sy,
        sWidth, sHeight,
        dx, dy,
        dWidth, dHeight,
        useViewport;

        if (arguments.length === 5 || arguments.length === 6) {
            sx = 0;
            sy = 0;
            sWidth = image.width;
            sHeight = image.height;
            dx = arguments[1];
            dy = arguments[2];
            dWidth = arguments[3];
            dHeight = arguments[4];
            useViewport = arguments[5];
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

        //
        // Convert from world to pixel coordinates on a few items.  Using
        // floor and ceil to prevent pixel boundary rendering issues.
        context.drawImage(
            image,
            sx, sy,
            sWidth, sHeight,
            Math.floor(dx * world.size + world.left), Math.floor(dy * world.size + world.top),
            Math.ceil(dWidth * world.size), Math.ceil(dHeight * world.size));
    }

    //------------------------------------------------------------------
    //
    // Draw a circle into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawCircle(center, radius, color) {
        context.beginPath();
        context.arc(center.x * canvas.width, center.y * canvas.width, 2 * radius * canvas.width, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }

    return {
        initialize: initialize,
        clear: clear,
        saveContext: saveContext,
        restoreContext: restoreContext,
        rotateCanvas: rotateCanvas,
        drawImage: drawImage,
        drawImageSpriteSheet: drawImageSpriteSheet,
        drawImageTileSet: drawImageTileSet,
        drawCircle: drawCircle,
        get viewport() { return viewport; }
    };
}());
