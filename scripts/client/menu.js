MyGame.screens['main-menu'] = (function(game) {
	'use strict';

	function initialize() {
		document.getElementById('id-new-game').addEventListener(
			'click',
			function() {MyGame.main.showScreen('game-play'); });

		document.getElementById('id-new-player').addEventListener(
			'click',
			function() {MyGame.main.showScreen('new-player'); });

		document.getElementById('id-options').addEventListener(
			'click',
			function() {MyGame.main.showScreen('options'); });
		
		document.getElementById('id-high-scores').addEventListener(
			'click',
			function() { MyGame.main.showScreen('high-scores'); });
		
		document.getElementById('id-about').addEventListener(
			'click',
			function() { MyGame.main.showScreen('about'); });
	}
	
	function run() {}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));