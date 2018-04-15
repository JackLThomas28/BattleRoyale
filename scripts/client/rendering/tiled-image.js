/* global Demo */

// ------------------------------------------------------------------
//
// Rendering function for a /Components/TiledImage object.
//
// ------------------------------------------------------------------
MyGame.renderer.TiledImage = (function(graphics) {
	'use strict';
	var that = {},
		RENDER_POS_EPISILON = 0.00001;

	function getTilePos(tileId, tileSize, width, height) {
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

	// ------------------------------------------------------------------
	//
	// Renders a TiledImage model.
	// TODO: This seems far too complex for what needs to be done, will
	// have to come back to this at some point and simplify the logic.
	//
	// ------------------------------------------------------------------
	that.render = function(image, viewport) {
		var tileSizeWorldCoords = image.size.width * (image.tileSize / image.pixel.width),
			oneOverTileSizeWorld = 1 / tileSizeWorldCoords,	// Combination of DRY and eliminating a bunch of divisions
			imageWorldXPos = viewport.left,
			imageWorldYPos = viewport.top,
			worldXRemain = 1.0,
			worldYRemain = 1.0,
			renderPosX = 0.0,
			renderPosY = 0.0,
			tileLeft,
			tileTop,
			tileAssetName,
			tileRenderXStart,
			tileRenderYStart,
			tileRenderXDist,
			tileRenderYDist,
			tileRenderWorldWidth,
			tileRenderWorldHeight;

		while (worldYRemain > RENDER_POS_EPISILON) {
			tileLeft = Math.floor(imageWorldXPos * oneOverTileSizeWorld);
			tileTop = Math.floor(imageWorldYPos * oneOverTileSizeWorld);

			if (worldXRemain === 1.0) {
				tileRenderXStart = imageWorldXPos * oneOverTileSizeWorld - tileLeft;
			} else {
				tileRenderXStart = 0.0;
			}
			if (worldYRemain === 1.0) {
				tileRenderYStart = imageWorldYPos * oneOverTileSizeWorld - tileTop;
			} else {
				tileRenderYStart = 0.0;
			}
			tileRenderXDist = 1.0 - tileRenderXStart;
			tileRenderYDist = 1.0 - tileRenderYStart;
			tileRenderWorldWidth = tileRenderXDist / oneOverTileSizeWorld;
			tileRenderWorldHeight = tileRenderYDist / oneOverTileSizeWorld;

			if (renderPosX + tileRenderWorldWidth > 1.0) {
				tileRenderWorldWidth = 1.0 - renderPosX;
				tileRenderXDist = tileRenderWorldWidth * oneOverTileSizeWorld;
			}
			if (renderPosY + tileRenderWorldHeight > 1.0) {
				tileRenderWorldHeight = 1.0 - renderPosY;
				tileRenderYDist = tileRenderWorldHeight * oneOverTileSizeWorld;
			}

			let tileId = 34;
			let tilePos = getTilePos(tileId, image.tileSize, 256, 256);

			// tileAssetName = image.assetKey + '-' + numberPad(tileTop * image.tilesX + tileLeft, 4);
		
			graphics.drawImageTileSet(MyGame.assets[image.assetKey],
				tilePos.x, tilePos.y,           // sx, sy
				image.tileSize, image.tileSize, // swidth, sheight
				renderPosX, renderPosY,
				tileRenderWorldWidth, tileRenderWorldHeight,
				true);
			imageWorldXPos += tileRenderWorldWidth;
			renderPosX += tileRenderWorldWidth;

			//
			// Subtract off how much of the current tile we used, if there isn't any
			// X distance to render, then move down to the next row of tiles.
			worldXRemain -= tileRenderWorldWidth;
			if (worldXRemain <= RENDER_POS_EPISILON) {
				imageWorldYPos += tileRenderWorldHeight;
				renderPosY += tileRenderWorldHeight;
				worldYRemain -= tileRenderWorldHeight;

				imageWorldXPos = viewport.left;
				renderPosX = 0.0;
				worldXRemain = 1.0;
			}
		}
	};

    return that;
}(MyGame.graphics));
