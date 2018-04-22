MyGame.renderer.DeploymentMap = (function(graphics) {
    'use strict';
    var that = {};

    function getTilePosition(tileId, tileSize, width, height) {
		let cols = width / tileSize,
			rows = height / tileSize,
			count = 0;
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				count += 1;
				if (count === tileId) {
					return {
						x: j * tileSize,
						y: i * tileSize
					};
				}
			}
		}
    }

    function renderMap(image, left, top, width, height) {
        graphics.drawImage(image,
            left, top, 
            width, height, 
            false);
    }

    function renderGrid(left, top, width, height) {
        let cellSize = 0.1,
            wIterations = width / cellSize,
            hIterations = height / cellSize;

        // Double For loop to render each map square
        for (let i = 0; i < wIterations; i++) {
            left = 0.0;
            for (let j = 0; j < hIterations; j++) { 
                graphics.drawRectangle('white', left, top, 
                    cellSize, cellSize);
                left += cellSize;
            }
            top += cellSize;
        }
    }

    function renderTimer(time) {
        let message = {
            font: '15px Arial',
            fill: 'white',
            text: 'Click in the grid where you would like to deploy',
            position: {
                x: 0.25,
                y: 0.05
            }
        };
        graphics.drawText(message);

        let text = {
            font: '30px Arial',
            fill: 'white',
            text: 'You have ' + String(time) + ' seconds remaining',
            position: {
                x: 0.2,
                y: 0.2
            }
        };
        graphics.drawText(text);
    }

    that.render = function(map) {
        let left = 0,
            top = 0,
            width = 1,
            height = 1;

        renderMap(map.image, left, top, width, height);
        renderGrid(left, top, width, height);
        renderTimer(map.remainingTime);
    };

    return that;
}(MyGame.graphics));