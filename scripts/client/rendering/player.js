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
        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction);
        graphics.drawImage(texture, model.position.x, model.position.y, 
            model.size.width, model.size.height, true);
        graphics.restoreContext();
        // graphics.saveContext();
        // graphics.drawFilledCircle('white', {x: 0.5, y: 0.5}, 0.01);
        // graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
