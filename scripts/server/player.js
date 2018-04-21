// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let random = require ('./random');

//------------------------------------------------------------------
//
// Public function used to initially create a newly connected player
// at some random location.
//
//------------------------------------------------------------------
function createPlayer() {
    let that = {};

    let position = {
        x: 0.5,
        y: 0.5
        // x: random.nextDouble(),
        // y: random.nextDouble()
    };

    let size = {
        width: 0.01,
        height: 0.01,
        radius: 0.02
    };
    let direction = 2 * Math.PI;    // Angle in radians
    let rotateRate = Math.PI / 1000;    // radians per millisecond
    let speed = 0.0004;                  // unit distance per millisecond
    let reportUpdate = false;    // Indicates if this model was updated during the last update

    Object.defineProperty(that, 'direction', {
        get: () => direction
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed
    })

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate
    });

    Object.defineProperty(that, 'reportUpdate', {
        get: () => reportUpdate,
        set: value => reportUpdate = value
    });

    Object.defineProperty(that, 'radius', {
        get: () => size.radius
    });

    //------------------------------------------------------------------
    //
    // Moves the player forward based on how long it has been since the
    // last move took place.
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime, worldBuffer) {
        reportUpdate = true;
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction);

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
        
        position.x = Math.max(position.x, worldBuffer.left);
        position.y = Math.max(position.y, worldBuffer.top);
        
        position.x = Math.min(position.x, worldBuffer.right);
        position.y = Math.min(position.y, worldBuffer.bottom);
    };

    that.moveBack = function(elapsedTime, worldBuffer) {
        reportUpdate = true;
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction);

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
        
        position.x = Math.max(position.x, worldBuffer.left);
        position.y = Math.max(position.y, worldBuffer.top);
        
        position.x = Math.min(position.x, worldBuffer.right);
        position.y = Math.min(position.y, worldBuffer.bottom);
    };
    //------------------------------------------------------------------
    //
    // moves the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime, worldBuffer) {
        reportUpdate = true;
        let vectorX = Math.cos(direction-(Math.PI/2));
        let vectorY = Math.sin(direction-(Math.PI/2));

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
        
        position.x = Math.max(position.x, worldBuffer.left);
        position.y = Math.max(position.y, worldBuffer.top);
        
        position.x = Math.min(position.x, worldBuffer.right);
        position.y = Math.min(position.y, worldBuffer.bottom);
    };

    //------------------------------------------------------------------
    //
    // moves the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime, worldBuffer) {
        reportUpdate = true;
        let vectorX = Math.cos(direction-(Math.PI/2));
        let vectorY = Math.sin(direction-(Math.PI/2));

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
        
        position.x = Math.max(position.x, worldBuffer.left);
        position.y = Math.max(position.y, worldBuffer.top);
        
        position.x = Math.min(position.x, worldBuffer.right);
        position.y = Math.min(position.y, worldBuffer.bottom);
    };

    that.rotate = function(elapsedTime, mousePos, world, viewport) {
        reportUpdate = true;
        let pos = {
            x: ((mousePos.x - world.left)/world.size) - (position.x - viewport.left),
            y: ((mousePos.y - world.top)/world.size) - (position.y - viewport.top)
        }
        direction = Math.atan2(pos.y,pos.x);
    };
    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
    //
    //------------------------------------------------------------------
    that.update = function(when) {
    };

    return that;
}

module.exports.create = () => createPlayer();
