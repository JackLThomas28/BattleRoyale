//------------------------------------------------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
MyGame.components.Player = function(viewport) {
    'use strict';
    let that = {};
    let position = {
        x: 0,
        y: 0
    };
    let localPosition = {
        x: viewport.width / 2,
        y: viewport.height / 2
    };
    let size = {
        width: 0.05,
        height: 0.05
    };
    let direction = 0;
    let rotateRate = 0;
    let speed = 0;
    
    let myViewport = viewport;

    Object.defineProperty(that, 'direction', {
        get: () => direction,
        set: (value) => { direction = value }
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed,
        set: value => { speed = value; }
    });

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate,
        set: value => { rotateRate = value; }
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'localPosition', {
        get: () => localPosition
    });

    //------------------------------------------------------------------
    //
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime) {
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction),
            proposedCenter = {
                x: localPosition.x + (vectorX * elapsedTime * speed),
                y: localPosition.y + (vectorY * elapsedTime * speed)
            };

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
        
        let pos = proposedCenter;
        pos = moveViewport(proposedCenter, elapsedTime, pos);

        localPosition.x = pos.x;
        localPosition.y = pos.y;
    };

    that.moveBack = function(elapsedTime) {
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction),
            proposedCenter = {
                x: localPosition.x - (vectorX * elapsedTime * speed),
                y: localPosition.y - (vectorY * elapsedTime * speed)
            };

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
        
        let pos = proposedCenter;
        pos = moveViewport(proposedCenter, elapsedTime, pos);

        localPosition.x = pos.x;
        localPosition.y = pos.y;
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction),
            proposedCenter = {
                x: localPosition.x + (vectorX * elapsedTime * speed),
                y: localPosition.y + (vectorY * elapsedTime * speed)
            };

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
        // direction += (rotateRate * elapsedTime);
        let pos = proposedCenter;
        pos = moveViewport(proposedCenter, elapsedTime, pos);

        localPosition.x = pos.x;
        localPosition.y = pos.y;
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction),
            proposedCenter = {
                x: localPosition.x - (vectorX * elapsedTime * speed),
                y: localPosition.y - (vectorY * elapsedTime * speed)
            };

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
        // direction -= (rotateRate * elapsedTime);
        let pos = proposedCenter;
        pos = moveViewport(proposedCenter, elapsedTime, pos);

        localPosition.x = pos.x;
        localPosition.y = pos.y;
    };

    that.rotate = function(elapsedTime, mousePos) {
        // TODO: Divide dynamically by the canvas width and height
        let pos = {
            x: (mousePos.x/600.0) - localPosition.x,
            y: (mousePos.y/600.0) - localPosition.y
        }
        direction = Math.atan2(pos.y,pos.x);
        
    }

    that.update = function(elapsedTime) {
    };

    // The player in terms of their position within the canvas
    function moveViewport(proposedCenter, elapsedTime, pos) {
        let vector = null;
        let maxBoundX = myViewport.width - myViewport.buffer,
            minBoundX = myViewport.buffer,
            maxBoundY = myViewport.height - myViewport.buffer,
            minBoundY = myViewport.buffer;

        if (proposedCenter.x >= maxBoundX || proposedCenter.x <= minBoundX) {
			vector = {
				x: Math.cos(direction) * speed * elapsedTime,
				y: 0
			};
            myViewport.move(vector);
			pos.x = (proposedCenter.x >= maxBoundX ? maxBoundX : minBoundX);
		}
		if (proposedCenter.y >= maxBoundY || proposedCenter.y <= minBoundY) {
			vector = {
				x: 0,
				y: Math.sin(direction) * speed * elapsedTime,
			};
			myViewport.move(vector);
			pos.y = (proposedCenter.y >= maxBoundY ? maxBoundY : minBoundY);
        }
        return pos;
    }

    return that;
};
