
MyGame.screens['new-player'] = (function(game, assets) {
	'use strict';
	let playerList = {};
	let socket = io();
	
	function initialize() {
		document.getElementById('id-new-player-back').addEventListener(
			'click',
			function() { MyGame.main.showScreen('main-menu'); });
		document.getElementById('id-login').addEventListener('click', login);
		document.getElementById('id-create-player').addEventListener('click', createPlayer);
	}
	
	function run() {}

	function login(){
		let userName = document.getElementById('username').value;
		let password = document.getElementById('password').value;
		let user = {username: userName, password: password};
		MyGame.screens['game-play'].login(user);
		resetHTML();
	}

	function createPlayer(){
		let userName = document.getElementById('username').value;
		let password = document.getElementById('password').value;
		let user = {username: userName, password: password};
		MyGame.screens['game-play'].createUser(user);
		resetHTML();
	}

	function resetHTML(){
		document.getElementById('username').value = "";
		document.getElementById('password').value = "";
		MyGame.main.showScreen('main-menu');
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));

