'use strict';

function createStorm(spec) {
    let that = {};

    let radius = spec.radius;
    let shrinkRate = radius / spec.time;

    Object.defineProperty(that, 'position', {
        get: () => spec.position
    });

    Object.defineProperty(that, 'radius', {
        get: () => radius
    });
    
    that.update = function(elapsedTime) {
        radius -= shrinkRate;
    };

    return that;
}

module.exports.create = (spec) => createStorm(spec);