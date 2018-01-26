
BasicGame.MainMenu = function (game) {
    this.playButton = null;
};

BasicGame.MainMenu.prototype = {

    create: function () {

        //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
        //	Here all we're doing is playing some music and adding a picture and button
        //	Naturally I expect you to do something significantly better :)

        this.playButton = this.add.button(400, 600, 'playButton', this.startGame, this);
    },

    update: function () {

        //	Do some nice funky main menu effect here

    },

    startGame: function (pointer) {
        //	And start the actual game
        this.state.start('Game');

    }

};
