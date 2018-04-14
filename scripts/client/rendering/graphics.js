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

    function drawImageTileSet(tileSet, tileSize, tilePos, center, size) {
        let localCenter = {
            x: center.x * canvas.width,
            y: center.y * canvas.height
        };
        // console.log('local center', localCenter);
        let localSize = {
            width: size.width * canvas.width,
            height: size.height * canvas.height
        };
        // console.log('local size', localSize);
        // console.log('size', size);
        // console.log('sx', tilePos.x);
        // console.log('sy', tilePos.y);
        // console.log('s-width', tileSize.width);
        // console.log('s-height', tileSize.height);
        // console.log('x', localCenter.x - localSize.width / 2);
        // console.log('y', localCenter.y - localSize.height / 2);
        // console.log('width', localSize.width);
        // console.log('height', localSize.height);
        context.drawImage(tileSet,
            tilePos.x, tilePos.y,                 // which tile to render
            tileSize.width, tileSize.height,      // size in the tileset
            localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width, localSize.height);
        saveContext();
        context.strokeStyle = 'black';
        context.strokeRect(localCenter.x - localSize.width/2, localCenter.y - localSize.height/2, localSize.width, localSize.height);
        context.strokeStyle = 'yellow';
        context.strokeRect(viewport.left * canvas.width, 
            viewport.top * canvas.height, 
            viewport.width * canvas.width, 
            viewport.height * canvas.height);
        restoreContext();
        // console.log('viewport top', viewport.top * canvas.height);
        // console.log('viewport left', viewport.left * canvas.width);
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
