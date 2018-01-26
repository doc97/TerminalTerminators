var content = [
    "The sky above the port was the color of television, tuned to a dead channel.",
    "`It's not like I'm using,' Case heard someone say, as he shouldered his way ",
    "through the crowd around the door of the Chat. `It's like my body's developed",
    "this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke.",
    "The Chatsubo was a bar for professional expatriates; you could drink there for",
    "a week and never hear two words in Japanese.",
    "",
    "Ratz was tending bar, his prosthetic arm jerking monotonously as he filled a tray",
    "of glasses with draft Kirin. He saw Case and smiled, his teeth a webwork of",
    "East European steel and brown decay. Case found a place at the bar, between the",
    "unlikely tan on one of Lonny Zone's whores and the crisp naval uniform of a tall",
    "African whose cheekbones were ridged with precise rows of tribal scars. `Wage was",
    "in here early, with two joeboys,' Ratz said, shoving a draft across the bar with",
    "his good hand. `Maybe some business with you, Case?'",
    "",
    "Case shrugged. The girl to his right giggled and nudged him.",
    "The bartender's smile widened. His ugliness was the stuff of legend. In an age of",
    "affordable beauty, there was something heraldic about his lack of it. The antique",
    "arm whined as he reached for another mug.",
    "",
    "",
    "From Neuromancer by William Gibson"
];

var line = [];

var wordIndex = 0;
var lineIndex = 0;

var wordDelay = 120;
var lineDelay = 400;



BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    this.nextLine = function() {};
    this.nextWord = function() {};
    nextLine: function() {
        console.log('hheelo');
        if (lineIndex === content.length) {
            //  We're finished
            return;
        }

        //  Split the current line on spaces, so one word per array element
        line = content[lineIndex].split(' ');
        
        //  Reset the word index to zero (the first word in the line)
        wordIndex = 0;
        
        //  Call the 'nextWord' function once for each word in the line (line.length)
        this.time.events.repeat(wordDelay, line.length, this.nextWord, this);
        
        //  Advance to the next line
        lineIndex++;
    },
            
    nextWord: function() {
        //  Add the next word onto the text string, followed by a space
        text.text = text.text.concat(line[wordIndex] + " ");
        
        //  Advance the word index to the next word in the line
        wordIndex++;
        
        //  Last word?
        if (wordIndex === line.length) {
            //  Add a carriage return
            text.text = text.text.concat("\n");
            
            //  Get the next line after the lineDelay amount of ms has elapsed
            this.time.events.add(lineDelay, this.nextLine, this);
        }
    },

};

BasicGame.Game.prototype = {
    
    create: function () {
        // Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        text = this.add.text(32, 32, 'heeelo', { font: "15px Arial", fill: "#19de65" });
        this.nextLine();
    },

    update: function () {
        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }
};
