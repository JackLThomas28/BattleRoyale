MyGame.screens['options'] = (function(game, keyboard, input) {
	'use strict';
	let up = null,
	down = null,
	right = null,
	left = null,
	shoot = null,
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

		up = MyGame.input.KeyEvent.DOM_VK_W,
		down = MyGame.input.KeyEvent.DOM_VK_S,
		right = MyGame.input.KeyEvent.DOM_VK_D,
		left = MyGame.input.KeyEvent.DOM_VK_A,
		shoot = MyGame.input.KeyEvent.DOM_VK_SPACE,
		boost = MyGame.input.KeyEvent.DOM_VK_SHIFT;
		
	}
	
	function run() {
		moveForwardInput.onkeyup = updateForward;
		// moveBackwardInput.onkeyup = updateBack; 
		// moveRightInput.onkeyup = updateRight;
		// moveLeftInput.onkeyup = updateLeft;
		// fireInput.onkeyup = updateFire;
		// boostInput.onkeyup = updateboost;
		console.log(MyGame.input.KeyEvent);

		// document.getElementById('moveForwardInput').innerHTML = "W";
		// document.getElementById('moveBackwardInput').innerHTML = "S";
		// document.getElementById('moveRightInput').innerHTML = "D";
		// document.getElementById('moveLeftInput').innerHTML = "A";
		// document.getElementById('fireInput').innerHTML = "Space";
		// document.getElementById('boostInput').innerHTML = "Shift";
	}

	function mapKeys(){
		if(newUp !== null){
			MyGame.screens['game-play'].updateKeyboard(newUp, up, NetworkIds.INPUT_MOVE_FORWARD);
			up = newUp;
			newUp = null;
		}
		if(newDown !== null){
			MyGame.screens['game-play'].updateKeyboard(newBack, back, NetworkIds.INPUT_MOVE_BACK);		
			down = newDown;
			newDown = null;
		}
		if(newLeft !== null){
			MyGame.screens['game-play'].updateKeyboard(newLeft, left, NetworkIds.INPUT_MOVE_LEFT);
			left = newLeft;
			newLeft = null;
		}
		if(newRight !== null){
			MyGame.screens['game-play'].updateKeyboard(newRight, right, NetworkIds.INPUT_MOVE_RIGHT);
			right = newRight;
			newRight = null;
		}
		if(newFire !== null){
			MyGame.screens['game-play'].updateKeyboard(newFire, fire, NetworkIds.INPUT_FIRE);
			fire = newFire;
			newFire = null;
		}
		//Need to handle boost
		MyGame.main.showScreen('main-menu');
	}


	function updateForward(e, ){
		newUp = e.keyCode;
	}
	function updateBackward(e){
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