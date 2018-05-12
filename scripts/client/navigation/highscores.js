MyGame.screens['high-scores'] = (function(game,input) {
	'use strict';
	function initialize() { 
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { MyGame.main.showScreen('main-menu'); });
	}

	function display(s) {
		let scores = document.getElementById('scores'),key;
		
		scores.innerHTML = '';
		let c = 0;
		for (key in s) {
			if(c < 5){
				scores.innerHTML += (s[key].username + ": " + s[key].score + "<br>"); 
			}
			c++;
		}
	}
	function read(){
		return MyGame.screens['game-play'].readHighScore();
	}
	function run() {
		let scores = read();
		display(scores);
		
		MyGame.screens['game-play'].leaveLobby();
	}
	
	return {
		initialize : initialize,
		run : run,
	};
}(MyGame.game, MyGame.input));
