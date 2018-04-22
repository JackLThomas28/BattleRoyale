// ------------------------------------------------------------------
//
// Rendering function for a Player object.
//
// ------------------------------------------------------------------
MyGame.renderer.Player = (function(graphics) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        let centerX = model.position.x - (model.size.width / 2),
            centerY = model.position.y - (model.size.height / 2);

        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction, true);
        graphics.drawImage(texture,
            centerX, centerY, 
            model.size.width, model.size.height, 
            true);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
