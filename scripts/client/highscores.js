MyGame.screens['high-scores'] = (function(game,input) {
	'use strict';
	let highScores = {}, previousScores = localStorage.getItem('Game.H');
	if (previousScores !== null) {
		highScores = JSON.parse(previousScores);
	}
	function initialize() { 
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { MyGame.main.showScreen('main-menu'); });
	}

	function add(key, value) {
		highScores[key] = value;
		localStorage['Game.H'] = JSON.stringify(highScores);
	}
	function display() {
		let scores = document.getElementById('scores'),key;
		
		scores.innerHTML = '';
		let c = 0;
		for (key in highScores) {
			if(c < 5){
				scores.innerHTML += (key + ": " + highScores[key] + "<br>"); 
			}
			c++;
		}
	}
	function run() {
		display();
	}
	
	return {
		initialize : initialize,
		run : run,
		add : add,
		display : display
	};
}(MyGame.game, MyGame.input));
