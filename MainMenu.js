
BasicGame.MainMenu = function (game) {
   
};

BasicGame.MainMenu.prototype = {

    create: function () {
        this.sound.play('track2');
        
        bg = this.add.sprite(this.camera.x, this.camera.y, 'main-menu-background');
        bg.scale.setTo(0.75, 0.75);
        bg.fixedToCamera = true;

        playButton = this.add.button(this.camera.x + this.camera.width/2, this.camera.y + this.camera.height * 4 / 7, 'playButton', function(){this.state.start('Game');this.sound.stopAll()}, this);
        playButton.scale.setTo(0.5, 0.5);
        playButton.anchor.setTo(0.5, 0.5);
        playButton.fixedToCamera = true;
        
        
        muteButton = this.add.button(this.camera.x + this.camera.width - 40, this.camera.y + 40, 'mute-audio', function(){
            if (this.sound.mute === false){
                this.sound.pauseAll();
                this.sound.mute = true;
            } else{
                this.sound.resumeAll();
                this.sound.mute = false;
            }
        }, this);
        muteButton.scale.setTo(0.5, 0.5);
        muteButton.anchor.setTo(1, 0);
        muteButton.fixedToCamera = true;
    },
    
    update: function () {


    },
}
