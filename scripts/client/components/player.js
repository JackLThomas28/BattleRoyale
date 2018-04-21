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
    let size = {
        width: 0.05,
        height: 0.05
    };
    let direction = 0;
    let rotateRate = 0;
    let speed = 0;

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

    //------------------------------------------------------------------
    //
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime) {
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction);

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
    };

    that.moveBack = function(elapsedTime) {
        let vectorX = Math.cos(direction),
            vectorY = Math.sin(direction);

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        let vectorX = Math.cos(direction-(Math.PI/2));
        let vectorY = Math.sin(direction-(Math.PI/2));

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        let vectorX = Math.cos(direction-(Math.PI/2));
        let vectorY = Math.sin(direction-(Math.PI/2));

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
    };

    that.rotate = function(elapsedTime, mousePos, world) {
        let pos = {
            x: ((mousePos.x - world.left)/world.size) - (position.x - viewport.left),
            y: ((mousePos.y - world.top)/world.size) - (position.y - viewport.top)
        }
        direction = Math.atan2(pos.y,pos.x);
    };

    that.update = function(elapsedTime) {
    };

    return that;
};
