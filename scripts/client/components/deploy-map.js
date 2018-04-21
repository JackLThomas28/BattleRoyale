MyGame.components.DeploymentMap = function(spec) {
    'use strict';
    var that = {
        get image() { return spec.image; },
        set remainingTime(time) { spec.remainingTime = time; },
        get remainingTime() { return spec.remainingTime; }
    };

    return that;
};