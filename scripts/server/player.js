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
        x: (Math.random() * (33 - 1) + 1) / 10,
        y: (Math.random() * (33 - 1) + 1) / 10
        // x: random.nextDouble(),
        // y: random.nextDouble()
    };

    let size = {
        width: 0.01,
        height: 0.01,
        radius: 0.02
    };
    let username = "New User";
    let password = null;
    let direction = 2 * Math.PI;    // Angle in radians
    let rotateRate = Math.PI / 1000;    // radians per millisecond
    let speed = 0.0004;                  // unit distance per millisecond
    let reportUpdate = false;    // Indicates if this model was updated during the last update

    let health = 100;
    let shield = 0;
    let boost = 100;


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

    Object.defineProperty(that, 'username', {
        get: () => username,
        set: value => username = value
    });
    Object.defineProperty(that, 'password', {
        get: () => password,
        set: value => password = value
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

    that.setDeployLocation = function(elapsedTime, mousePos, world, viewport) {
        let pos = {
            x: ((mousePos.x - world.left) / world.size) * world.width,
            y: ((mousePos.y - world.top) / world.size) * world.height
        };

        let minX = Math.floor(pos.x * 100) / 100,
            maxX = Math.ceil(pos.x * 100) / 100,
            minY = Math.floor(pos.y * 100) / 100,
            maxY = Math.floor(pos.y * 100) / 100;
        
        if (minX === 0.0) {
            minX += world.buffer * world.width;
        }
        if (maxX === 3.2) {
            maxX -= world.buffer * world.width;
        }
        if (minY === 0.1) {
            minY += world.buffer * world.width;
        }
        if (maxY === 3.2) {
            maxY -= world.buffer * world.width;
        }
        
        position.x = Math.random() * (maxX - minX) + minX;
        position.y = Math.random() * (maxY - minY) + minY;
    }

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

        position.x -= (vectorX * elapsedTime * speed);
        position.y -= (vectorY * elapsedTime * speed);
        
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

        position.x += (vectorX * elapsedTime * speed);
        position.y += (vectorY * elapsedTime * speed);
        
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

    that.updateUser = function(spec){
        that.username = spec.username;
        that.password = spec.password;
    }
    that.getUserName = function(){return that.username;}


    return that;
}

module.exports.create = () => createPlayer();
