MyGame.renderer.Structure = (function(graphics) {
    'use strict';
    let that = {};

    that.render = function(structure) {
        let dx = structure.center.x - structure.width / 2,
            dy = structure.center.y - structure.height / 2;

        graphics.drawImage(structure.image, 
            dx, dy,
            structure.width, structure.height,
            true);
    };
    
    return that;
}(MyGame.graphics));