MyGame.components.DeploymentMap = function(spec) {
    'use strict';
    var that = {
        get tileSize() { return spec.tileSize; },
        get size() { return spec.size; },
        get pixel() { return spec.pixel; },
        get assetKey() { return spec.assetKey; },
        get map() { return spec.map; },
        set remainingTime(time) { spec.remainingTime = time; },
        get remainingTime() { return spec.remainingTime; }
    };

    return that;
};