
MyGame.components.particleSystem.createEffectExplosion = function(spec) {
	'use strict';
	console.log('Spec',spec);
	var effect = { },
		particle = 0;
	effect.update = function() {

		for (particle = 0; particle < spec.howMany; particle += 1) {
			//
			// Create a new fire particle
			MyGame.components.particleSystem.createParticle({
				image: MyGame.assets['fireParticle'],
				center: { x: spec.center.x, y: spec.center.y },
				size: Random.nextGaussian(0.015, 0.005),
				direction: Math.random(),
				direction: Random.nextCircleVector(),
				speed: Random.nextGaussian(0.0003, 0.0001),
				rateRotation: (2 * Math.PI) / 1000,	// Radians per millisecond
				lifetime: Random.nextGaussian(1500, 250)
			});
		}

		return false;	// One time emit!
	};
	return MyGame.components.particleSystem.addEffect(effect);
};