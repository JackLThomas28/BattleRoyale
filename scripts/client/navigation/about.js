MyGame.screens['about'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-about-back').addEventListener(
			'click',
			function() { MyGame.main.showScreen('main-menu'); });
	}
	
	function run() {
		MyGame.screens['game-play'].leaveLobby();
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));
