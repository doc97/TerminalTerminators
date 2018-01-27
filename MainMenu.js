
BasicGame.MainMenu = function (game) {
    
};

BasicGame.MainMenu.prototype = {

    create: function () {

        // We've already preloaded our assets, so let's kick right into the Main
		// Menu itself.
        // Here all we're doing is playing some music and adding a picture and
		// button
        // Naturally I expect you to do something significantly better :)

        playButton = this.add.button(this.world.width/2, this.world.height/2, 'playButton', this.startGame, this);
        playButton.anchor.setTo(0.5, 0.5);
    },

    update: function () {

        // Do some nice funky main menu effect here

    },

    startGame: function (pointer) {
        // And start the actual game
        this.state.start('Game');

    }

};
