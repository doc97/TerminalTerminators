BasicGame.Preloader = function(game) {
	this.ready = false;
};

BasicGame.Preloader.prototype = {
	preload : function() {

		// These are the assets we loaded in Boot.js
		// A nice sparkly background and a loading progress bar

		// This sets the preloadBar sprite as a loader sprite.
		// What that does is automatically crop the sprite from 0 to full-width
		// as the files below are loaded in.

		// Here we load the rest of the assets our game needs.
		// As this is just a Project Template I've not provided these assets,
		// swap them for your own.
		// + lots of other required assets here
		this.load.image('playButton', 'assets/play-btn.png');
		this.load.image('menu', 'assets/pause-menu.png');
		this.load.image('pauseButton', 'assets/pause-btn.png');
		this.load.image('settings', 'assets/settings-menu.png');
	},

	create : function() {

	},

	update : function() {

		// You don't actually need to do this, but I find it gives a much
		// smoother game experience.
		// Basically it will wait for our audio file to be decoded before
		// proceeding to the MainMenu.
		// You can jump right into the menu if you want and still play the
		// music, but you'll have a few
		// seconds of delay while the mp3 decodes - so if you need your music to
		// be in-sync with your menu
		// it's best to wait for it to decode here first, then carry on.

		// If you don't have any music in your game then put the
		// game.state.start line into the create function and delete
		// the update function completely.

		if (/* this.cache.isSoundDecoded('titleMusic') && */this.ready == false) {
			this.ready = true;
			this.state.start('MainMenu');
		}
	}
};
