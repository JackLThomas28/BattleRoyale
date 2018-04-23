//------------------------------------------------------------------
//
// This function provides the "game" code.
//
//------------------------------------------------------------------
MyGame.screens['game-play'] = (function(graphics, renderer, input, components, assets) {
    'use strict';
    let keyMap = {}, previousOptions = localStorage.getItem('Game.H');
    let lastTimeStamp = performance.now(),
        myKeyboard = input.Keyboard(),
        playerSelf = {
            model: components.Player(graphics.viewport),
            texture: MyGame.assets['player-self'],
            id : null
        },
        playerOthers = {},
        missiles = {},
        explosions = {},
        messageHistory = Queue.create(),
        messageId = 1,
        nextExplosionId = 1,
        socket = io(),
        networkQueue = Queue.create(),
        myMouse = null,
        background = null,
        world = {	// The size of the world must match the world-size of the background image
			get left() { return 0; },
			get top() { return 0; },
			get width() { return 3.2; },
			get height() { return 3.2; },
			get bufferSize() { return 0.1; }
		},
		worldBuffer = {
			get left() { return world.left + world.bufferSize; },
			get top() { return world.top + world.bufferSize; },
			get right() { return world.width - world.bufferSize; },
			get bottom() { return world.height - world.bufferSize; }
        },
        map = null,
        onDeploymentScreen = null,
        miniMap = null,
        deploymentMap = null,
        storm = null;
        msgList = [];

    
    socket.on(NetworkIds.CONNECT_ACK, data => {
        if(data){
            playerSelf.id = data.id;
        }
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_ACK,
            data: data
        });
    });

    socket.on(NetworkIds.CONNECT_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.DISCONNECT_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.DISCONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_SELF, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_SELF,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_DEPLOY_TIMER, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_DEPLOY_TIMER,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_STORM_TIMER, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_STORM_TIMER,
            data: data
        });
    });
    
    socket.on(NetworkIds.UPDATE_STORM, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_STORM,
            data: data
        });
    });

    socket.on(NetworkIds.MISSILE_NEW, data => {
        networkQueue.enqueue({
            type: NetworkIds.MISSILE_NEW,
            data: data
        });
    });

    socket.on(NetworkIds.MISSILE_HIT, data => {
        networkQueue.enqueue({
            type: NetworkIds.MISSILE_HIT,
            data: data
        });
    });

    socket.on(NetworkIds.CREATE_USER, data => {
        networkQueue.enqueue({
            type: NetworkIds.CREATE_USER,
            data: data
        });
    });

    socket.on(NetworkIds.LOGIN, data => {
        networkQueue.enqueue({
            type: NetworkIds.LOGIN,
            data: data
        });
    });

    socket.on(NetworkIds.MESSAGE, data => {
        if(data.message !== ""){
            msgList = data.message;
            console.log(data.message)
        }
        displayMsg();
        networkQueue.enqueue({
            type: NetworkIds.MESSAGE,
            data: data
        });
    });
    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerSelf(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;

        playerSelf.model.size.x = data.size.x;
        playerSelf.model.size.y = data.size.y;

        playerSelf.model.direction = data.direction;
        playerSelf.model.speed = data.speed;
        playerSelf.model.rotateRate = data.rotateRate;
    }

    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerOther(data) {
        let model = components.PlayerRemote();
        model.state.position.x = data.position.x;
        model.state.position.y = data.position.y;
        model.state.direction = data.direction;
        model.state.lastUpdate = performance.now();

        model.goal.position.x = data.position.x;
        model.goal.position.y = data.position.y;
        model.goal.direction = data.direction;
        model.goal.updateWindow = 0;

        model.size.x = data.size.x;
        model.size.y = data.size.y;

        playerOthers[data.clientId] = {
            model: model,
            texture: MyGame.assets['player-other']
        };
    }

    //------------------------------------------------------------------
    //
    // Handler for when another player disconnects from the game.
    //
    //------------------------------------------------------------------
    function disconnectPlayerOther(data) {
        delete playerOthers[data.clientId];
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about the self player.
    //
    //------------------------------------------------------------------
    function updatePlayerSelf(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;
        playerSelf.model.direction = data.direction;

        //
        // Remove messages from the queue up through the last one identified
        // by the server as having been processed.
        let done = false;
        while (!done && !messageHistory.empty) {
            if (messageHistory.front.id === data.lastMessageId) {
                done = true;
            }
            messageHistory.dequeue();
        }

        //
        // Update the client simulation since this last server update, by
        // replaying the remaining inputs.
        let memory = Queue.create();
        while (!messageHistory.empty) {
            let message = messageHistory.dequeue();
            switch (message.type) {
                case 'move':
                    playerSelf.model.move(message.elapsedTime);
                    break;
                case 'rotate-right':
                    playerSelf.model.rotateRight(message.elapsedTime);
                    break;
                case 'rotate-left':
                    playerSelf.model.rotateLeft(message.elapsedTime);
                    break;
            }
            memory.enqueue(message);
        }
        messageHistory = memory;
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about other players.
    //
    //------------------------------------------------------------------
    function updatePlayerOther(data) {
        if (playerOthers.hasOwnProperty(data.clientId)) {
            let model = playerOthers[data.clientId].model;
            model.goal.updateWindow = data.updateWindow;

            model.goal.position.x = data.position.x;
            model.goal.position.y = data.position.y
            model.goal.direction = data.direction;
        }
    }

    function updateDeploymentTimer(data) {
        deploymentMap.remainingTime = data;
        if (deploymentMap.remainingTime <= 0) {
            onDeploymentScreen = false;
        }
    }

    function updateStormTimer(data) {
        miniMap.remainingTime = data;
    }

    function updateStorm(data) {
        storm.radius = data.radius;
        storm.position = data.position;
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving notice of a new missile in the environment.
    //
    //------------------------------------------------------------------
    function missileNew(data) {
        missiles[data.id] = components.Missile({
            id: data.id,
            radius: data.radius,
            speed: data.speed,
            direction: data.direction,
            position: {
                x: data.position.x,
                y: data.position.y
            },
            timeRemaining: data.timeRemaining
        });
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving notice that a missile has hit a player.
    //
    //------------------------------------------------------------------
    function missileHit(data) {
        explosions[nextExplosionId] = components.AnimatedSprite({
            id: nextExplosionId++,
            spriteSheet: MyGame.assets['explosion'],
            spriteSize: { width: 0.07, height: 0.07 },
            spriteCenter: data.position,
            spriteCount: 16,
            spriteTime: [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
        });

        //
        // When we receive a hit notification, go ahead and remove the
        // associated missle from the client model.
        delete missiles[data.missileId];
    }

    //------------------------------------------------------------------
    //
    // Process the registered input handlers here.
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        //
        // Start with the keyboard updates so those messages can get in transit
        // while the local updating of received network messages are processed.
        myKeyboard.update(elapsedTime);

        myMouse.update(elapsedTime, onDeploymentScreen);

        //
        // Double buffering on the queue so we don't asynchronously receive messages
        // while processing.
        let processMe = networkQueue;
        networkQueue = networkQueue = Queue.create();
        while (!processMe.empty) {
            let message = processMe.dequeue();
            switch (message.type) {
                case NetworkIds.CONNECT_ACK:
                    connectPlayerSelf(message.data);
                    break;
                case NetworkIds.CONNECT_OTHER:
                    connectPlayerOther(message.data);
                    break;
                case NetworkIds.DISCONNECT_OTHER:
                    disconnectPlayerOther(message.data);
                    break;
                case NetworkIds.UPDATE_SELF:
                    updatePlayerSelf(message.data);
                    break;
                case NetworkIds.UPDATE_OTHER:
                    updatePlayerOther(message.data);
                    break;
                case NetworkIds.UPDATE_DEPLOY_TIMER:
                    updateDeploymentTimer(message.data);
                    break;
                case NetworkIds.UPDATE_STORM_TIMER:
                    updateStormTimer(message.data);
                    break;
                case NetworkIds.UPDATE_STORM:
                    updateStorm(message.data);
                    break;
                case NetworkIds.MISSILE_NEW:
                    missileNew(message.data);
                    break;
                case NetworkIds.MISSILE_HIT:
                    missileHit(message.data);
                    break;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Update the game simulation
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        playerSelf.model.update(elapsedTime);
        for (let id in playerOthers) {
            playerOthers[id].model.update(elapsedTime);
        }

        let removeMissiles = [];
        for (let missile in missiles) {
            if (!missiles[missile].update(elapsedTime)) {
                removeMissiles.push(missiles[missile]);
            }
        }

        for (let missile = 0; missile < removeMissiles.length; missile++) {
            delete missiles[removeMissiles[missile].id];
        }

        for (let id in explosions) {
            if (!explosions[id].update(elapsedTime)) {
                delete explosions[id];
            }
        }

        graphics.viewport.update(playerSelf.model);
    }

    //------------------------------------------------------------------
    //
    // Render the current state of the game simulation
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();

        if (onDeploymentScreen) {
            renderer.DeploymentMap.render(deploymentMap);
        } else {
            renderer.TiledImage.render(background, graphics.viewport);
            renderer.Player.render(playerSelf.model, playerSelf.texture);
            renderer.Storm.render(storm);

            for (let id in playerOthers) {
                let player = playerOthers[id];
                // Make sure we are not rendering the whole map
                // TODO: adjust for player FOV
                if (player.model.state.position.x >= graphics.viewport.left && 
                    player.model.state.position.x <= graphics.viewport.right && 
                    player.model.state.position.y >= graphics.viewport.top &&
                    player.model.state.position.y <= graphics.viewport.bottom) {

                    renderer.PlayerRemote.render(player.model, player.texture);
                }
            }

            for (let missile in missiles) {
                renderer.Missile.render(missiles[missile]);
            }

            for (let id in explosions) {
                renderer.AnimatedSprite.render(explosions[id]);
            }
            renderer.MiniMap.render(miniMap, 
                playerSelf.model.position, world);
        }
    }

    //------------------------------------------------------------------
    //
    // Client-side game loop
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    };

    // function used to sort the map into separate arrays for each row 
    // of the map
    function parseMap(map) {
        let newMap = {
            height: map.height,
            width: map.width,
            data: []
        };
        let row = [];
        for (let i = 0; i < map.data.length; i++) {
            if (i % map.width === 0 && i !== 0) {
                newMap.data.push(row);
                row = [];
            }
            row.push(map.data[i]);
        }
        return newMap;
    }

    //------------------------------------------------------------------
    //
    // Public function used to get the game initialized and then up
    // and running.
    //
    //------------------------------------------------------------------
    function initialize() {
        console.log('game initializing...');

        var backgroundKey = 'background';

        myMouse = input.Mouse();
		//
		// Get the intial viewport settings prepared.
		MyGame.graphics.viewport.set(0.0, 0.0, 0.3); // The buffer can't really be any larger than world.buffer, guess I could protect against that.

        map = assets['background-object'].layers[0];
        map = parseMap(map);

        let imageData = {
            pixel: { width: map.width * 32,
                     height: map.height * 32 },
			size: { width: world.width, height: world.height },
			tileSize: 32,
            assetKey: backgroundKey,
            map: map
        };
        //
		// Define the TiledImage model we'll be using for our background.
		background = components.TiledImage(imageData);
        deploymentMap = components.DeploymentMap({
            image: assets['background-image'],
            remainingTime: null});
        miniMap = components.DeploymentMap({image: assets['background-image']});
        storm = {
            radius: null,
            position: null
        };

        myMouse.registerHandler('mousemove', (elapsedTime, mousePosition) => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_ROTATE,
                position: mousePosition,
                world: graphics.world,
                viewport: graphics.viewport
            };
            socket.emit(NetworkIds.INPUT, message);
            messageHistory.enqueue(message);
            playerSelf.model.rotate(elapsedTime, mousePosition, graphics.world);
        });

        myMouse.registerHandler('mousedown', (elapsedTime, mousePosition) => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_DEPLOY_POSITION,
                position: mousePosition,
                world: {
                        left: graphics.world.left,
                        top: graphics.world.top,
                        size: graphics.world.size,
                        width: world.width,
                        height: world.height,
                        buffer: world.bufferSize
                    }
            };
            socket.emit(NetworkIds.INPUT, message);
            messageHistory.enqueue(message);
        });

        if(previousOptions === null){
            add('forward', MyGame.input.KeyEvent.DOM_VK_W);
            add('back', MyGame.input.KeyEvent.DOM_VK_S);
            add('right', MyGame.input.KeyEvent.DOM_VK_D);
            add('left', MyGame.input.KeyEvent.DOM_VK_A);
            add('fire', MyGame.input.KeyEvent.DOM_VK_SPACE);
            add('boost', MyGame.input.KeyEvent.DOM_VK_SHIFT);
        }
        if (previousOptions !== null) {
            keyMap = JSON.parse(previousOptions);
        }
        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_MOVE_FORWARD,
                worldBuffer: worldBuffer
            };
            socket.emit(NetworkIds.INPUT, message);
            messageHistory.enqueue(message);
            playerSelf.model.moveForward(elapsedTime, worldBuffer);
        },
        keyMap['forward'], true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_MOVE_BACK,
                    worldBuffer: worldBuffer
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.moveBack(elapsedTime, worldBuffer);
            },
            keyMap['back'], true);

            myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_ROTATE_RIGHT,
                    worldBuffer: worldBuffer
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.rotateRight(elapsedTime, worldBuffer);
            },
            keyMap['right'], true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_ROTATE_LEFT,
                    worldBuffer: worldBuffer
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.rotateLeft(elapsedTime, worldBuffer);
            },
            keyMap['left'], true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_FIRE
            };
            socket.emit(NetworkIds.INPUT, message);
        },
        keyMap['fire'], true,300);

        console.log(playerSelf);
    
    }

    function run(){
        // Get the game loop started
        MyGame.graphics.initialize();
        onDeploymentScreen = true;
        requestAnimationFrame(gameLoop);
    }

    function updateKeyboard(keyCode, oldKey, inputType, moveType){
        let keys = myKeyboard.getKeys();
        myKeyboard.unregisterHandler(oldKey, keys[oldKey][0].id)

        if(moveType === "fire"){
            myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_FIRE
                };
                socket.emit(NetworkIds.INPUT, message);
            },
            keyCode, true);
            add(moveType, keyCode);
        }
        else{
            myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: inputType,
                    worldBuffer: worldBuffer
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.moveForward(elapsedTime, worldBuffer);
            },
            keyCode, true);
            add(moveType, keyCode);
        }
    }

    function add(key, value) {
		keyMap[key] = value;
		localStorage['Game.H'] = JSON.stringify(keyMap);
    }
    function remove(key) {
        delete keyMap.key
		localStorage['Game.H'] = JSON.stringify(keyMap);
    }

    function getKeyMap(){
        return keyMap;
    }

    function createUser(user){
        let message = {
            id: messageId++,
            elapsedTime: 0,
            type: NetworkIds.CREATE_USER,
            user: user,
            playerId : playerSelf.id
        };
        console.log(message);
        socket.emit(NetworkIds.CREATE_USER, message);
    }

    function login(user){
        let message = {
            id: messageId++,
            elapsedTime: 0,
            type: NetworkIds.LOGIN,
            user: user,
            playerId : playerSelf.id
        };
        socket.emit(NetworkIds.LOGIN, message);
    }

    function sendMessage(m){
        let message = {
            id: messageId++,
            elapsedTime: 0,
            type: NetworkIds.MESSAGE,
            message: m,
            playerId : playerSelf.id
        };
        socket.emit(NetworkIds.MESSAGE, message);
    }

    function displayMsg(){
        console.log(msgList);
        document.getElementById("messageList").innerHTML = "";
        let display = document.getElementById("messageList");
        for(let i=0; i<msgList.length; i++){
            display.innerHTML += msgList[i].user + ": " + msgList[i].msg + '<br>';
        }
    }
    
    return {
        initialize : initialize,
        run: run,
        updateKeyboard : updateKeyboard,
        getKeyMap : getKeyMap,
        createUser : createUser,
        login : login,
        sendMessage : sendMessage
    };
 
}(MyGame.graphics, MyGame.renderer, MyGame.input, MyGame.components, MyGame.assets));
