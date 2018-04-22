// ------------------------------------------------------------------
//
// Rendering function for an AnimatedSprite object.
//
// ------------------------------------------------------------------
MyGame.renderer.AnimatedSprite = (function(graphics) {
    'use strict';
    let that = {};

    that.render = function(sprite) {
        let spriteSheet = sprite.spriteSheet,
            spriteId = sprite.sprite,
            sx = spriteId * sprite.pixelHeight,
            sy = 0,
            sWidth = sprite.pixelWidth,
            sHeight = sprite.pixelHeight,
            dx = sprite.center.x - sprite.width / 2,
            dy = sprite.center.y - sprite.height / 2,
            dWidth = sprite.width,
            dHeight = sprite.height;

        graphics.drawImage(spriteSheet, 
            sx, sy, 
            sWidth, sHeight, 
            dx, dy, 
            dWidth, dHeight, 
            true);
    };

    return that;
}(MyGame.graphics));
