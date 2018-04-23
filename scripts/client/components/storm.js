MyGame.components.Storm = function(spec) {
    'use strict';
    var that = {
        get radius() { return spec.radius; },
        get position() { return spec.position; }
    };
    return that;
}