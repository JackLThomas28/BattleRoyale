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

    function renderMap(image) {
        let tilePos = {},
            tileRenderWorldWidth = (image.tileSize / image.pixel.width),
            tileRenderWorldHeight = (image.tileSize / image.pixel.height),
            renderPosY = 0.0;

        // Double For loop to render each map square
        for (let i = 0; i < image.map.data.length; i++) {
            let renderPosX = 0.0;
            for (let j = 0; j < image.map.data[i].length; j++) {
                tilePos = getTilePosition(image.map.data[i][j], 
                    image.tileSize, 256, 256);

                renderPosX += tileRenderWorldWidth;

                graphics.drawImage(MyGame.assets[image.assetKey],
                    tilePos.x, tilePos.y,
                    image.tileSize, image.tileSize,
                    renderPosX, renderPosY,
                    tileRenderWorldWidth, tileRenderWorldHeight);
            }
            renderPosY += tileRenderWorldHeight;
        }
    }

    function renderGrid(image) {
        let tileRenderWorldWidth = (image.tileSize / image.pixel.width),
            tileRenderWorldHeight = (image.tileSize / image.pixel.height),
            renderPosY = 0.0,
            cellSize = 0.1;

        // Double For loop to render each map square
        for (let i = 0; i < image.map.data.length; i+=10) {
            let renderPosX = 0.0;
            for (let j = 0; j < image.map.data[i].length; j+=10) { 
                graphics.drawRectangle('white', renderPosX, renderPosY, 
                    cellSize, cellSize);
                renderPosX += cellSize;
            }
            renderPosY += cellSize;
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

    that.render = function(image) {
        renderMap(image);
        renderGrid(image);
        renderTimer(image.remainingTime);
    };

    return that;
}(MyGame.graphics));