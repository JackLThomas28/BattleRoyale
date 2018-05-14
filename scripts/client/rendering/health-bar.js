MyGame.renderer.HealthBar = (function(graphics) {
    'use strict';
    var that = {},
        healthBarHeight = 0.006;

    that.render = function(model) {
        let percentGreen = model.health / 100;
		// Render a little bar above the spaceship that represents the health
		// of the ship.
		graphics.drawRectangle(
			'rgba(0, 0, 0, 255)',
            model.position.x - model.size.width / 2, 
            model.position.y - (model.size.height / 2) - healthBarHeight / 2,
			model.size.width, healthBarHeight,
			true);

		//
		// Fill the whole thing with red
		graphics.drawFilledRectangle(
			'rgba(255, 0, 0, 255)',
            model.position.x - model.size.width / 2, 
            model.position.y - (model.size.height / 2) - healthBarHeight / 2,
			model.size.width, healthBarHeight,
			true);

		//
		// Cover up with the green portion
		graphics.drawFilledRectangle(
			'rgba(0, 255, 0, 255)',
            model.position.x - model.size.width / 2, 
            model.position.y - (model.size.height / 2) - healthBarHeight / 2,
			model.size.width * percentGreen, healthBarHeight,
			true);
    };

    return that;
}(MyGame.graphics));
