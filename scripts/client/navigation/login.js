MyGame.screens['login'] = (function(game) {
	'use strict';
	
	function initialize() {
        document.getElementById('id-register').addEventListener(
            'click', 
            createPlayer );
        
        document.getElementById('id-login').addEventListener(
            'click', 
            login );
	}
	
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

    function run() {}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));

