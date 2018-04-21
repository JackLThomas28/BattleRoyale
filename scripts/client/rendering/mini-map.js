MyGame.renderer.MiniMap = (function(graphics) {
    'use strict';
    var that = {};

    function drawMiniMap(image, left, top, scale) {
        graphics.drawImage(image,
            left, top, 
            scale, scale, 
            false, false);
    }
   
    function drawPlayerPosition(position, scale, x, width, height, world) {
        graphics.drawFilledRectangle('red', 
            (position.x * scale / world.width) + x, 
            (position.y * scale / world.height), 
            width, 
            height);
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

    that.render = function(map, position, world) {
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
        
        // Draw the number of remaining players
        drawPlayersLeft(0, left, top, scale, scale);
    };

    return that;
}(MyGame.graphics));