// ------------------------------------------------------------------
//
// Rendering function for a PlayerRemote object.
//
// ------------------------------------------------------------------
MyGame.renderer.PlayerRemote = (function(graphics) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a PlayerRemote model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        let centerX = model.state.position.x - (model.size.width / 2),
            centerY = model.state.position.y - (model.size.height / 2);
        graphics.saveContext();
        graphics.rotateCanvas(model.state.position, model.state.direction);
        graphics.drawImage(texture, 
            centerX, centerY, 
            model.size.width, model.size.height, 
            true);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
