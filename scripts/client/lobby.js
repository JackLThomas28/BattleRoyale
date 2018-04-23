MyGame.screens['lobby'] = (function() {

    function initialize() { 
		document.getElementById('id-lobby-back').addEventListener(
			'click',
            function() { MyGame.main.showScreen('main-menu'); });
        document.getElementById('sendMsg').addEventListener('click', sendMsg);
        MyGame.screens['game-play'].sendMessage("");
    }
    
    function sendMsg(){
        let msg = document.getElementById('msg').value;
        MyGame.screens['game-play'].sendMessage(msg);
		document.getElementById('msg').value = "Type a message";
    }
    function run() {}
    return {
		initialize : initialize,
		run : run
	};
}());