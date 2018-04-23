MyGame.renderer.Storm = (function(graphics) {
    'use strict';
    var that = {};

    that.render = function(storm) {
        graphics.drawCircle('white', storm.position, storm.radius, true);
    };

    return that;
}(MyGame.graphics));