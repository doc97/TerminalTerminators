
BasicGame.MainMenu = function (game) {
   
};

BasicGame.MainMenu.prototype = {

    create: function () {

       
        this.sound.play('track2');
        playButton = this.add.button(this.camera.x + this.camera.width/2, this.camera.y + this.camera.height/2, 'playButton', function(){this.state.start('Game');this.sound.stopAll()}, this);
        playButton.anchor.setTo(0.5, 0.5);
        playButton.fixedToCamera = true;
        
        
        muteButton = this.add.button(this.camera.x + this.camera.width/2, this.camera.y + this.camera.height*(2/3), 'mute-audio', function(){
        	if (this.sound.mute === false){
        		this.sound.pauseAll();
        		this.sound.mute = true;
        	} else{
        		this.sound.resumeAll();
        		this.sound.mute = false;
     	}
        }, this);
        muteButton.anchor.setTo(0.5, 0.5);
        muteButton.fixedToCamera = true;
    },
    
    update: function () {


    },
}
