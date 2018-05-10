MyGame.screens['about'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-about-back').addEventListener(
			'click',
			function() { MyGame.main.showScreen('main-menu'); });
	}
	
	function run() {}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));
