// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let fs = require('fs');
let present = require('present');
let Player = require('./player');
let Missile = require('./missile');
let Storm = require('./storm');
let NetworkIds = require('../shared/network-ids');
let Queue = require('../shared/queue.js');

const STATE_UPDATE_RATE_MS = 50;
let lastUpdate = 0;
let quit = false;
let activeClients = {};
let newMissiles = [];
let activeMissiles = [];
let hits = [];
let inputQueue = Queue.create();
let nextMissileId = 1;
let deploymentTimer = 10;
let currTime = 0;
let stormTimer = 300;
let storm = Storm.create({
    radius: 1.6 + 0.8,
    time: stormTimer,
    position: {
        x: 1.6,
        y: 1.6
    }
});
let buildings = createBuildings(15);
let playerCount = 0;

let msgList = [];
let players = [];
let Lobby = {
    requiredCount: 2,
    count: 0
};
let inGame = false;


//------------------------------------------------------------------
//
// Used to create a missile in response to user input.
//
//------------------------------------------------------------------
function createMissile(clientId, playerModel) {
    let missile = Missile.create({
        id: nextMissileId++,
        clientId: clientId,
        position: {
            x: playerModel.position.x,
            y: playerModel.position.y
        },
        direction: playerModel.direction,
        speed: playerModel.speed
    });

    newMissiles.push(missile);
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function createBuildings(count) {
    let structures = [];
    let minX = 0.0,
        maxX = 3.2,
        minY = 0.0,
        maxY = 3.2;

    for (let i = 0; i < count; i++) {
        structures.push({
            size: { width: 0.1, height: 0.1 },
            position: { 
                x: getRandomFloat(minX, maxX), 
                y: getRandomFloat(minY, maxY) },
            radius: 0.03
        });
        structures.push({
            size: { width: 0.1, height: 0.1 },
            position: { 
                x: getRandomFloat(minX, maxX), 
                y: getRandomFloat(minY, maxY) },
            radius: 0.03
        });
        structures.push({
            size: { width: 0.1, height: 0.1 },
            position: { 
                x: getRandomFloat(minX, maxX), 
                y: getRandomFloat(minY, maxY) },
            radius: 0.03
        });
    }
    return structures;
}


//------------------------------------------------------------------
//
// Process the network inputs we have received since the last time
// the game loop was processed.
//
//------------------------------------------------------------------
function processInput(elapsedTime) {
    //
    // Double buffering on the queue so we don't asynchronously receive inputs
    // while processing.
    let processMe = inputQueue;
    while (!processMe.empty) {
        let input = processMe.dequeue();
        let client = activeClients[input.clientId];
        client.lastMessageId = input.message.id;
        switch (input.message.type) {
            case NetworkIds.INPUT_DEPLOY_POSITION:
                client.player.setDeployLocation(input.message.elapedTime,
                    input.message.position, input.message.world);
                break;
            case NetworkIds.INPUT_MOVE_FORWARD:
                client.player.moveForward(input.message.elapsedTime,
                    input.message.worldBuffer);
                break;
            case NetworkIds.INPUT_MOVE_BACK:
                client.player.moveBack(input.message.elapsedTime,
                    input.message.worldBuffer);
                break;
            case NetworkIds.INPUT_ROTATE:
                client.player.rotate(input.message.elapsedTime, 
                    input.message.position, input.message.world, 
                    input.message.viewport);
                break;
            case NetworkIds.INPUT_ROTATE_LEFT:
                client.player.rotateLeft(input.message.elapsedTime, 
                    input.message.worldBuffer);
                break;
            case NetworkIds.INPUT_ROTATE_RIGHT:
                client.player.rotateRight(input.message.elapsedTime,
                    input.message.worldBuffer);
                break;
            case NetworkIds.INPUT_FIRE:
                createMissile(input.clientId, client.player);
                break;
            case NetworkIds.CREATE_USER:
                createPlayer(input.message.user,input.message.playerId);
                break;
            case NetworkIds.LOGIN:
                loginUser(input.message.user,input.message.playerId);
                break;
            case NetworkIds.MESSAGE:
                sendMessage(input.message.message,input.message.playerId);
                break;
            case NetworkIds.JOIN_LOBBY:
                Lobby.count++;
                break;
            case NetworkIds.LEAVE_LOBBY:
                Lobby.count--;
                break;
        }
    }
    inputQueue = Queue.create();
}



//------------------------------------------------------------------
//
// Utility function to perform a hit test between two objects.  The
// objects must have a position: { x: , y: } property and radius property.
//
//------------------------------------------------------------------
function collided(obj1, obj2) {
    let distance = Math.sqrt(Math.pow(obj1.position.x - obj2.position.x, 2) + Math.pow(obj1.position.y - obj2.position.y, 2));
    let radii = obj1.radius + obj2.radius;

    return distance <= radii;
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    for (let clientId in activeClients) {
        activeClients[clientId].player.update(currentTime);
    }

    for (let missile = 0; missile < newMissiles.length; missile++) {
        newMissiles[missile].update(elapsedTime);
    }

    let keepMissiles = [];
    for (let missile = 0; missile < activeMissiles.length; missile++) {
        //
        // If update returns false, that means the missile lifetime ended and
        // we don't keep it around any longer.
        if (activeMissiles[missile].update(elapsedTime)) {
            keepMissiles.push(activeMissiles[missile]);
        }
    }
    activeMissiles = keepMissiles;
    activeMissiles = checkBuildingCollision(activeMissiles, buildings);
    activeMissiles = checkPlayerCollision(activeMissiles, activeClients);
}

function checkBuildingCollision(missiles, buildings) {
    let keepMissiles = [];
    for (let missile = 0; missile < missiles.length; missile++) {
        let hit = false;
        for (let build in buildings) {
            if (collided(missiles[missile], buildings[build])) {
                hit = true;
                hits.push({
                    building: buildings[build],
                    missileId: missiles[missile].id,
                    position: buildings[build].position
                });
            }
        }
        if (!hit) {
            keepMissiles.push(missiles[missile]);
        }
    }
    return keepMissiles;
}

function checkPlayerCollision(missiles, clients) {
    let keepMissiles = [];
    for (let missile = 0; missile < missiles.length; missile++) {
        let hit = false;
        for (let clientId in clients) {
            if (clientId !== missiles[missile].clientId) {
                if (collided(missiles[missile], clients[clientId].player)) {
                    hit = true;
                    hits.push({
                        clientId: clientId,
                        missileId: missiles[missile].id,
                        position: clients[clientId].player.position,
                        damage: 25
                    });
                }
            }
        }
        if (!hit) {
            keepMissiles.push(missiles[missile]);
        }
    }
    return keepMissiles;
}

function timeUnitPassed(time, unit) {
    if (time >= unit) {
        time = 0;
        return true;
    }
    return false;
}

function updateClientTimers(timer, networkId) {
    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            direction: client.player.direction,
            position: client.player.position,
            updateWindow: lastUpdate
        };
        client.socket.emit(networkId, timer);
    }
}

function updateClientStorm(networkId) {
    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            radius: storm.radius,
            position: storm.position
        };
        client.socket.emit(networkId, update);
    }
}

function startClientGames() {
    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId
        };
        client.socket.emit(NetworkIds.START_GAME, update);
    }
}

//------------------------------------------------------------------
//
// Send state of the game to any connected clients.
//
//------------------------------------------------------------------
function updateClients(elapsedTime) {
    //
    // For demonstration purposes, network updates run at a slower rate than
    // the game simulation.
    lastUpdate += elapsedTime;
    if (lastUpdate < STATE_UPDATE_RATE_MS) {
        return;
    }

    currTime += elapsedTime;
    if (timeUnitPassed(currTime, 1000)) {
        currTime = 0;

        if (deploymentTimer > 0) {
            deploymentTimer--;
            updateClientTimers(deploymentTimer, NetworkIds.UPDATE_DEPLOY_TIMER);
        }
        if (stormTimer > 0 && deploymentTimer === 0) {
            stormTimer--;
            updateClientTimers(stormTimer, NetworkIds.UPDATE_STORM_TIMER);
            storm.update(elapsedTime);
            updateClientStorm(NetworkIds.UPDATE_STORM);
        }
    }

    //
    // Build the missile messages one time, then reuse inside the loop
    let missileMessages = [];
    for (let item = 0; item < newMissiles.length; item++) {
        let missile = newMissiles[item];
        missileMessages.push({
            id: missile.id,
            direction: missile.direction,
            position: {
                x: missile.position.x,
                y: missile.position.y
            },
            radius: missile.radius,
            speed: missile.speed,
            timeRemaining: missile.timeRemaining
        });
    }

    //
    // Move all the new missiles over to the active missiles array
    for (let missile = 0; missile < newMissiles.length; missile++) {
        activeMissiles.push(newMissiles[missile]);
    }
    newMissiles.length = 0;

    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            direction: client.player.direction,
            position: client.player.position,
            updateWindow: lastUpdate,
            playerCount: playerCount
        };
        
        if (client.player.reportUpdate) {
            client.socket.emit(NetworkIds.UPDATE_SELF, update);
            //
            // Notify all other connected clients about every
            // other connected client status...but only if they are updated.
            for (let otherId in activeClients) {
                if (otherId !== clientId) {
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                }
            }
        }

        //
        // Report any new missiles to the active clients
        for (let missile = 0; missile < missileMessages.length; missile++) {
            client.socket.emit(NetworkIds.MISSILE_NEW, missileMessages[missile]);
        }

        //
        // Report any missile hits to this client
        for (let hit = 0; hit < hits.length; hit++) {
            client.socket.emit(NetworkIds.MISSILE_HIT, hits[hit]);

            // Take the health away from the player that was hit
            if (hits[hit].clientId === client.player.clientId) {
                client.socket.emit(NetworkIds.TAKE_HEALTH, hits[hit]);
            }
        }
    }

    for (let clientId in activeClients) {
        activeClients[clientId].player.reportUpdate = false;
    }

    //
    // Don't need these anymore, clean up
    hits.length = 0;

    //
    // Reset the elapsedt time since last update so we can know
    // when to put out the next update.
    lastUpdate = 0;
}

//------------------------------------------------------------------
//
// Server side game loop
//
//------------------------------------------------------------------
function gameLoop(currentTime, elapsedTime) {
    processInput(elapsedTime);
    if (Lobby.count >= Lobby.requiredCount) {
        if (!inGame) {
            startClientGames();
            inGame = true;
        }
    }

    if (inGame) {
        update(elapsedTime, currentTime);
        updateClients(elapsedTime);
    }

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, STATE_UPDATE_RATE_MS);
    }
}

//------------------------------------------------------------------
//
// Get the socket.io server up and running so it can begin
// collecting inputs from the connected clients.
//
//------------------------------------------------------------------
function initializeSocketIO(httpServer) {
    let io = require('socket.io')(httpServer);

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the arrival of this
    // new client.  Plus, tell the newly connected client about the
    // other players already connected.
    //
    //------------------------------------------------------------------
    function notifyConnect(socket, newPlayer) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (newPlayer.clientId !== clientId) {
                //
                // Tell existing about the newly connected player
                client.socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: newPlayer.clientId,
                    direction: newPlayer.direction,
                    position: newPlayer.position,
                    rotateRate: newPlayer.rotateRate,
                    speed: newPlayer.speed,
                    size: newPlayer.size
                });

                //
                // Tell the new player about the already connected player
                socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: client.player.clientId,
                    direction: client.player.direction,
                    position: client.player.position,
                    rotateRate: client.player.rotateRate,
                    speed: client.player.speed,
                    size: client.player.size
                });
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the disconnect of
    // another client.
    //
    //------------------------------------------------------------------
    function notifyDisconnect(playerId) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (playerId !== clientId) {
                client.socket.emit(NetworkIds.DISCONNECT_OTHER, {
                    clientId: playerId
                });
            }
        }
    }
    
    io.on('connection', socket => {
        console.log('Connection established: ', socket.id);
        //
        // Create an entry in our list of connected clients
        playerCount++;

        let newPlayer = Player.create()
        newPlayer.clientId = socket.id;
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };
        let scores = initHighScore();


        socket.on(NetworkIds.MESSAGE, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on(NetworkIds.JOIN_LOBBY, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on(NetworkIds.LEAVE_LOBBY, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });
        
        socket.on(NetworkIds.LOGIN, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on(NetworkIds.CREATE_USER, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on(NetworkIds.INPUT, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on('disconnect', function() {
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });

        socket.emit(NetworkIds.CONNECT_ACK, {
            direction: newPlayer.direction,
            position: newPlayer.position,
            size: newPlayer.size,
            rotateRate: newPlayer.rotateRate,
            speed: newPlayer.speed,
            score : scores,
            buildings: buildings,
            id : socket.id
        });

        notifyConnect(socket, newPlayer);
    });
}

function createPlayer(spec,id){
    players.push(spec);
    activeClients[id].player.updateUser(spec);
    let newUser = JSON.stringify(players);
    fs.writeFile('./assets/players.json', newUser,function(err){
        if(err){
            console.log(err);
        }
    });

}
function loginUser(user,id){
    activeClients[id].player.updateUser(user);
    for(let i=0; i<players.length; i++){
        if(user.username === players[i].username && user.password === players[i].password){
            console.log("Successful Login");
            return;
        }
    }
    console.log("Login Failed");
}

function initPlayers(){
    let raw = fs.readFileSync('./assets/players.json');
    players = JSON.parse(raw);
    if(players === undefined) players = [];
}

function initHighScore(){
    let raw = fs.readFileSync('./assets/highScores.json');
    let scores = JSON.parse(raw);
    if(scores === undefined) scores = [];
    return scores;
}

function sendMessage(msg, playerId){
    if(msg !== ""){
        let temp = {user: activeClients[playerId].player.getUserName(), msg: msg}
        msgList.push(temp);
    }
    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        client.socket.emit(NetworkIds.MESSAGE, {
            message: msgList,
            id : playerId
        });
    }
}
    

//------------------------------------------------------------------
//
// Entry point to get the game started.
//
//------------------------------------------------------------------
function initialize(httpServer) {
    initPlayers();
    initializeSocketIO(httpServer);
    gameLoop(present(), 0);
}

//------------------------------------------------------------------
//
// Public function that allows the game simulation and processing to
// be terminated.
//
//------------------------------------------------------------------
function terminate() {
    this.quit = true;
}

module.exports.initialize = initialize;
