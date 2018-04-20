MyGame.renderer.MiniMap = (function(graphics) {
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

    function renderMap(image, position) {
        let mapScalingFactor = 0.3,
            tileRenderWorldWidth = (image.tileSize / image.pixel.width) * mapScalingFactor,
            tileRenderWorldHeight = (image.tileSize / image.pixel.height) * mapScalingFactor,
            renderPosY = 0.0,
            renderPosX = 1 - mapScalingFactor,
            mapWidth = tileRenderWorldWidth * image.map.width,
            mapHeight = tileRenderWorldHeight * image.map.height;
        
        drawBorder(renderPosX, renderPosY, mapWidth, mapHeight);

        drawMiniMap(image, renderPosX, renderPosY, mapScalingFactor, 
            tileRenderWorldWidth, tileRenderWorldHeight);

        // Draw the player's position on the mini map
        renderPosX = 1 - mapScalingFactor;
        drawPlayerPosition(position, mapScalingFactor, renderPosX, 
            tileRenderWorldWidth, tileRenderWorldHeight);
        
        drawPlayersLeft(0, renderPosX, renderPosY, mapWidth, mapHeight);
    }
    function drawMiniMap(image, left, top, scale, tileWidth, tileHeight) {
        let tilePos = {};
        // Double For loop to render each map square
        for (let i = 0; i < image.map.data.length; i++) {
            left = 1 - scale;
            for (let j = 0; j < image.map.data[i].length; j++) {
                tilePos = getTilePosition(image.map.data[i][j], 
                    image.tileSize, 256, 256);

                left += tileWidth;

                graphics.drawImage(MyGame.assets[image.assetKey],
                    tilePos.x, tilePos.y,
                    image.tileSize, image.tileSize,
                    left, top,
                    tileWidth, tileHeight);
            }
            top += tileHeight;
        }
    }
   
    function drawPlayerPosition(position, scale, x, tileWidth, tileHeight) {
        graphics.drawFilledRectangle('red', 
            (position.x * scale) + x, 
            (position.y * scale), 
            tileWidth * 2, 
            tileHeight * 2);
    }

    function drawBorder(left, top, width, height) {
        graphics.drawRectangle('white', left, top, width, height);
    }

    function drawPlayersLeft(playersLeft, left, top, mapWidth, mapHeight) {
        let text = {
            font: '15px Arial',
            fill: 'white',
            text: 'Alive: ' + String(playersLeft),
            position: {
                x: left,
                y: top + mapHeight + 0.01
            }
        };
        graphics.drawText(text);
    }

    that.render = function(image, position) {
        renderMap(image, position);
        // renderTimer(image.remainingTime);
    };

    return that;
}(MyGame.graphics));