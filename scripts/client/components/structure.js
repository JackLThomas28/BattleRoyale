MyGame.components.Structure = function(spec) {
    'use strict';
    let that = {
        get image() { return spec.image; },
        get width() { return spec.size.width; }, 
        get height() { return spec.size.height; },
        get position() { return spec.position; }
    };

    return that;
}