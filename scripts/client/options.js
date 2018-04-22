MyGame.screens['options'] = (function(game, keyboard, input) {
	'use strict';
	let up = null,
	down = null,
	right = null,
	left = null,
	fire = null,
	boost = null,
	newUp = null,
	newDown = null,
	newLeft = null,
	newRight = null,
	newFire = null,
	newBoost = null;

	function initialize() {
		document.getElementById('id-options-back').addEventListener(
			'click',
			function() { MyGame.main.showScreen('main-menu'); });

		document.getElementById('map-keys').addEventListener('click', mapKeys);
	
	}
	
	function run() {
		let map = MyGame.screens['game-play'].getKeyMap();
		console.log("init map: ",map);
		up = map['forward'];
		down = map['down'];
		left = map['left'];
		right = map['right'];
		fire = map['fire'];
		boost = map['boost'];

		moveForwardInput.onkeyup = updateForward;
		moveBackwardInput.onkeyup = updateBack; 
		moveRightInput.onkeyup = updateRight;
		moveLeftInput.onkeyup = updateLeft;
		fireInput.onkeyup = updateFire;
		boostInput.onkeyup = updateBoost;

		// document.getElementById('moveForwardInput').innerHTML = "W";
		// document.getElementById('moveBackwardInput').innerHTML = "S";
		// document.getElementById('moveRightInput').innerHTML = "D";
		// document.getElementById('moveLeftInput').innerHTML = "A";
		// document.getElementById('fireInput').innerHTML = "Space";
		// document.getElementById('boostInput').innerHTML = "Shift";
	}

	function mapKeys(){
		if(newUp !== null){
			MyGame.screens['game-play'].updateKeyboard(newUp, up, NetworkIds.INPUT_MOVE_FORWARD, "forward");
			up = newUp;
			newUp = null;
		}
		if(newDown !== null){
			MyGame.screens['game-play'].updateKeyboard(newBack, back, NetworkIds.INPUT_MOVE_BACK, "back");		
			down = newDown;
			newDown = null;
		}
		if(newLeft !== null){
			MyGame.screens['game-play'].updateKeyboard(newLeft, left, NetworkIds.INPUT_MOVE_LEFT, "left");
			left = newLeft;
			newLeft = null;
		}
		if(newRight !== null){
			MyGame.screens['game-play'].updateKeyboard(newRight, right, NetworkIds.INPUT_MOVE_RIGHT, "right");
			right = newRight;
			newRight = null;
		}
		if(newFire !== null){
			MyGame.screens['game-play'].updateKeyboard(newFire, fire, NetworkIds.INPUT_FIRE, "fire");
			fire = newFire;
			newFire = null;
		}
		//Need to handle boost
		MyGame.main.showScreen('main-menu');
	}


	function updateForward(e, ){
		newUp = e.keyCode;
	}
	function updateBack(e){
		newDown = e.keyCode;
	}
	function updateLeft(e){
		newLeft= e.keyCode;
	}
	function updateRight(e){
		newRight = e.keyCode;
	}
	function updateFire(e){
		newFire = e.keyCode;
	}
	function updateBoost(e){
		newBoost = e.keyCode;
	}
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));