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
    let health = 100;
    let shield = 0;
    let boost = 100;

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

    Object.defineProperty(that, 'health', {
        get: () => health,
        set: value => health = value
    });

    Object.defineProperty(that, 'shield', {
        get: () => shield,
        set: value => shield = value
    });

    Object.defineProperty(that, 'boost', {
        get: () => boost,
        set: value => boost = value
    });

    //------------------------------------------------------------------
    //
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime, worldBuffer) {
        if (worldBuffer === undefined) {
            return;
        }
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
        if (worldBuffer === undefined) {
            return;
        }

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
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime, worldBuffer) {
        if (worldBuffer === undefined) {
            return;
        }
        let vectorX = Math.cos(direction-(Math.PI/2));
        let vectorY = Math.sin(direction-(Math.PI/2));

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
        
        position.x = Math.max(position.x, worldBuffer.left);
        position.y = Math.max(position.y, worldBuffer.top);
        
        position.x = Math.min(position.x, worldBuffer.right);
        position.y = Math.min(position.y, worldBuffer.bottom);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime, worldBuffer) {
        if (worldBuffer === undefined) {
            return;
        }
        let vectorX = Math.cos(direction-(Math.PI/2));
        let vectorY = Math.sin(direction-(Math.PI/2));

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
        
        position.x = Math.max(position.x, worldBuffer.left);
        position.y = Math.max(position.y, worldBuffer.top);
        
        position.x = Math.min(position.x, worldBuffer.right);
        position.y = Math.min(position.y, worldBuffer.bottom);
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
