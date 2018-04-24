MyGame.renderer.MiniMap = (function(graphics) {
    'use strict';
    var that = {};
    
    //------------------------------------------------------------------
	//
	// Zero pad a number, adapted from Stack Overflow.
	// Source: http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
	//
	//------------------------------------------------------------------
	function numberPad(n, p, c) {
		var padChar = typeof c !== 'undefined' ? c : '0',
			pad = new Array(1 + p).join(padChar);

		return (pad + n).slice(-pad.length);
    }

    function drawMiniMap(image, left, top, scale) {
        graphics.drawImage(image,
            left, top, 
            scale, scale, 
            false);
    }
   
    function drawPlayerPosition(position, scale, x, width, height, world) {
        graphics.drawFilledRectangle('red', 
            (position.x * scale / world.width) + x, 
            (position.y * scale / world.height), 
            width, 
            height);
    }

    function drawBorder(left, top, width, height) {
        graphics.drawRectangle('white', left - 0.005, top - 0.005, width + 0.005, height + 0.005);
    }

    function drawStorm(storm, scale, world, left) {
        let position = {
                x: (storm.position.x * scale / world.width) + left,
                y: storm.position.y * scale / world.height
            },
            radius = storm.radius * scale / world.width;
        graphics.drawCircle('white', position, radius, false);
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

    function drawRemainingTime(time, left, top, mapWidth, mapHeight) {
        let minutes = Math.floor(time / 60),
            seconds = numberPad((time % 60), 2);
        let text = {
            font: '15px Arial',
            fill: 'white',
            text: 'Time: ' + String(minutes) + ':' + String(seconds),
            position: {
                x: left + mapWidth / 2,
                y: top + mapHeight + 0.01
            }
        };
        graphics.drawText(text);
    }

    that.render = function(map, position, world, storm) {
        let scale = 0.3,
            left = 1 - scale,
            top = 0.0,
            playerWidth = 0.008,
            playerHeight = 0.008;

        // Draw a border around the mini map
        drawBorder(left, top, scale, scale);

        // Draw the actual mini map
        drawMiniMap(map.image, left, top, scale);//, mapWidth, mapHeight);

        // Draw the player's position on the mini map
        drawPlayerPosition(position, scale, left, 
            playerWidth, playerHeight, world);
       
        // Draw the storm on the mini-map
        drawStorm(storm, scale, world, left);
        
        // Draw the number of remaining players
        drawPlayersLeft(map.aliveCount, left, top, scale, scale);

        // Draw the time remaining
        drawRemainingTime(map.remainingTime, left, top, scale, scale);
    };

    return that;
}(MyGame.graphics));