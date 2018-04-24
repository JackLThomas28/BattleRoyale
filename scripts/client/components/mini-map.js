MyGame.components.MiniMap = function(spec) {
    'use strict';
    var that = {
        get image() { return spec.image; },
        set remainingTime(time) { spec.remainingTime = time; },
        get remainingTime() { return spec.remainingTime; },
        set aliveCount(count) { spec.aliveCount = count; },
        get aliveCount() { return spec.aliveCount; },
    };

    return that;
};
