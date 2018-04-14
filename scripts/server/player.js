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
        x: random.nextDouble(),
        y: random.nextDouble()
    };

    let size = {
        width: 0.01,
        height: 0.01,
        radius: 0.02
    };
    let direction = random.nextDouble() * 2 * Math.PI;    // Angle in radians
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

    Object.defineProperty(that, 'localPosition', {
        set: value => localPosition = value
    });

    //------------------------------------------------------------------
    //
    // Moves the player forward based on how long it has been since the
    // last move took place.
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction);

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
    };

    that.moveBack = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction);

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
    };
    //------------------------------------------------------------------
    //
    // moves the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction);

        position.x += (vectorX * elapsedTime * speed);
        // position.y += (vectorY * elapsedTime * speed);
        // direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // moves the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction);

        position.x -= (vectorX * elapsedTime * speed);
        // position.y -= (vectorY * elapsedTime * speed);
        // direction -= (rotateRate * elapsedTime);
    };

    that.rotate = function(elapsedTime, mousePos, localPosition) {
        reportUpdate = true;
        // TODO: Divide dynamically by the canvas width and height
        let pos = {
            x: (mousePos.x/600.0) - localPosition.x,
            y: (mousePos.y/600.0) - localPosition.y
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
