BasicGame.Preloader = function(game) {
	this.ready = false;
};

BasicGame.Preloader.prototype = {
	preload : function() {
	
		
		this.load.image('playButton', 'assets/play-btn.png');
		this.load.image('menu', 'assets/pause-menu.png');
		this.load.image('pauseButton', 'assets/pause-btn.png');
		this.load.image('settings', 'assets/settings-menu.png');
		this.load.image('virus', 'assets/virus.png');
		this.load.image('mute-audio', 'assets/mute-audio.png');
		
		this.load.audio('modem-remix', 'assets/soundtrack/Theme_modem_remix.ogg');
		this.load.audio('ambient-track', 'assets/soundtrack/bonus_ambient_track.ogg');
		this.load.audio('jumpy-melody', 'assets/soundtrack/Theme_jumpy_melody.ogg');
		this.load.audio('track1', 'assets/soundtrack/track1.ogg');
		this.load.audio('track2', 'assets/soundtrack/track2.ogg');
		this.load.audio('track3', 'assets/soundtrack/track3.ogg');

		this.sound.add('track1', 1, true); // In-game
		this.sound.add('track2', 1, true); // Main menu
		this.sound.add('track3', 1, true); // Game over
		this.sound.add('modem-remix', 1, true); // Instructions
		this.sound.add('jumpy-melody', 1, true); // Not used
	},

	create : function() {

	},

	update : function() {

		

		if (/* this.cache.isSoundDecoded('titleMusic') && */this.ready == false) {
			this.ready = true;
			this.state.start('MainMenu');
		}
	}
};
