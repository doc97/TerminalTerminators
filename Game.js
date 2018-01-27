class Node {
    /* 
     * integer x: X-position in world coordinates
     * integer y: Y-position in world coordinates
     * string id: The character displayed on the node
     * Phaser.State state: Use 'this'
     */
    constructor(x, y, id, state) {
        this.x = x;
        this.y = y;
        this.idText = state.add.text(x, y, id, { font: '15px Arial', fill: '#ffffff' });
        this.children = [];
        this.paths = [];

        this.render = function(state) {
            for (var i = 0; i < this.paths.length; ++i) {
                state.game.debug.geom(this.paths[i]);
            }
        }

        this.addChild = function(node) {
            this.children.push(node);
            this.paths.push(new Phaser.Line(this.x, this.y, node.x, node.y));
        };

        this.destroy = function() {
            this.idText.kill();
        };
    }
}

class Network {
    /*
     * integer[] layers: Amount of nodes per layers
     */
    constructor(layers, state) {
        this.nodes = [];

        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
        var nodeDistanceX = 64;
        var nodeDistanceY = 96;

        // Create nodes
        for (var i = 0; i < layers.length; ++i) {
            var nodeCount = layers[i];
            for (var j = 0; j < nodeCount; ++j) {
                var offset = 0.0;
                if (nodeCount % 2 == 0)
                    offset = -0.5;

                var x = state.world.width / 2 - (nodeDistanceX * (offset + Math.floor(nodeCount / 2))) + j * nodeDistanceX;
                var y = state.world.height / 2 + i * nodeDistanceY;
                var index = i * layers.length + j;
                var node = new Node(x, y, alphabet[index], state);
                this.nodes.push(node);
            }
        }

        // Create paths
        for (var i = 0; i < layers.length - 1; ++i) {
            var nodeCount = layers[i];
            for (var j = 0; j < nodeCount; ++j) {
                for (var k = 0; k < layers[i + 1]; ++k) {
                    var index = i * layers.length + j;
                    var childIndex = index - j + nodeCount + k;
                    var child = this.nodes[childIndex];
                    console.log(i + ', ' + j + ', ' + k);
                    console.log(child);
                    this.nodes[index].addChild(this.nodes[childIndex]);
                }
            }
        }

        this.render = function(state) {
            for (var i = 0; i < this.nodes.length; ++i) {
                this.nodes[i].render(state);
            }
        }
    }
}

class Terminal {
    /*
    * Phaser.State state: Use 'this'
    */
   constructor(state) {
        this.command = state.add.text(state.camera.x + 16, state.camera.y + state.camera.height - 32, '$ ', { font: '15px Arial', fill: '#ffffff' });
        this.buffer = state.add.text(state.camera.x + 16, state.camera.y + state.camera.height - 32, '', { font: '15px Arial', fill: '#ffffff' });
        this.buffer.anchor.setTo(0, 1);

        state.input.keyboard.addCallbacks(this, null, null, function(ch) { this.command.setText(this.command.text + ch, true); });

        this.enterKey = state.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(function() {
            var cmdStr = this.command.text.substring(2, this.command.text.length);
            var cmd = cmdStr.split(' ');

            this.command.setText('$ ', true);

            if (cmd[0] === 'clear') {
                this.buffer.setText('');
            } else if (cmd[0] === 'print' && cmd.length > 1) {
                this.buffer.setText(this.buffer.text + '\n' + cmd[1]);
            } else {
                this.command.setText('$ ', true);
                this.buffer.setText(this.buffer.text + '\n' + cmd + ': command not found');
            }
        }, this);

        this.backspaceKey = state.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
        this.backspaceKey.onDown.add(function() {
            if (this.command.text.length > 2) {
                this.command.setText(this.command.text.substring(0, this.command.text.length - 1));
            }
        }, this);

        this.destroy = function() {
            this.command.kill();
            this.buffer.kill();
            this.enterKey.kill();
            this.backspaceKey.kill();
        };
    }
}



/* Game code */
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

    // When a State is added to Phaser it automatically has the following
	// properties set on it, even if they already exist:

    this.game;      // a reference to the currently running game (Phaser.Game)
    this.add;       // used to add sprites, text, groups, etc
					// (Phaser.GameObjectFactory)
    this.camera;    // a reference to the game camera (Phaser.Camera)
    this.cache;     // the game cache (Phaser.Cache)
    this.input;     // the global input manager. You can access
					// this.input.keyboard, this.input.mouse, as well from it.
					// (Phaser.Input)
    this.load;      // for preloading assets (Phaser.Loader)
    this.math;      // lots of useful common math operations (Phaser.Math)
    this.sound;     // the sound manager - add a sound, play one, set-up
					// markers, etc (Phaser.SoundManager)
    this.stage;     // the game stage (Phaser.Stage)
    this.time;      // the clock (Phaser.Time)
    this.tweens;    // the tween manager (Phaser.TweenManager)
    this.state;     // the state manager (Phaser.StateManager)
    this.world;     // the game world (Phaser.World)
    this.particles; // the particle manager (Phaser.Particles)
    this.physics;   // the physics manager (Phaser.Physics)
    this.rnd;       // the repeatable random number generator
					// (Phaser.RandomDataGenerator)

    // You can use any of these from any function within this State.
    // But do consider them as being 'reserved words', i.e. don't create a
    // property for your own game called "world" or you'll over-write the world
    // reference.

    this.view = 0; // 0 = terminal, 1 = map

    this.switch = function() {
        if (this.view == 0) {
            console.log(this.view);
            this.camera.y = this.world.height - 2 * (this.camera.height - 32);
            this.view = 1;
        } else {
            console.log(this.view);
            this.camera.y = this.world.height - this.camera.height;
            this.view = 0;
        }
    };

};

BasicGame.Game.prototype = {
    
    create: function () {
        // Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        // text = this.add.text(32, 32, '', { font: "15px Arial", fill: "#19de65" });
        // this.nextLine();

        // Camera origin: upper-left
        this.camera.setSize(640, 480);
        this.world.resize(this.camera.width * 3, this.camera.height * 3);
        this.camera.setPosition((this.world.width - this.camera.width) / 2, this.world.height - this.camera.height);
        terminal = new Terminal(this);
        network = new Network([3, 4, 2], this);

        tabKey = this.input.keyboard.addKey(Phaser.Keyboard.TAB);
        tabKey.onDown.add(this.switch, this);


        /*
         * Code for the pause menu
         */

        // Create a label to use as a button
        pauseButton = this.add.button(this.camera.width - 70, 40, 'pauseButton', function(str) {
	    	// When the pause button is pressed, we pause the game
	        this.paused = true;
	
	        // Then add the menu
	        menu = this.add.sprite(this.camera.width/2, this.camera.height/2, 'menu');
	        menu.anchor.setTo(0.5, 0.5);
                menu.fixedToCamera = true;
	
	        // And a label to illustrate which menu item was chosen. (This is
			// not
			// necessary)
	        choiseLabel = this.add.text(this.camera.width/2, 30, 'Click outside to continue', { font: '30px Arial', fill: '#ffffff' });
	        choiseLabel.anchor.setTo(0.5, 0.5);
                choiseLabel.fixedToCamera = true;
	    }, this);
        pauseButton.anchor.setTo(0.5, 0.5);
        pauseButton.fixedToCamera = true;
	
	    // Add a input listener that can help us return from being paused
	    this.input.onDown.add(unpause, this);
	
	    // And finally the method that handels the pause menu
	    function unpause(event){
	        // Only act if paused
	        if(this.paused){
	            // Calculate the corners of the menu
	            var x1 = this.camera.width/2 - menu.width/2 , x2 = this.camera.width/2 + menu.width/2,
	                y1 = this.camera.height/2 - menu.height/2, y2 = this.camera.height/2 + menu.height/2;
	
	            // Check if the click was inside the menu
	            if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
	                // The choicemap is an array that will help us see which
					// item
					// was clicked
	                var choisemap = ['one', 'two', 'three', 'four'];
	
	                // Get menu local coordinates for the click
	                var x = event.x - x1,
	                    y = event.y - y1;
	               
	                // Calculate the choice
	                var choise = Math.floor(x / (menu.width/2)) + 2*Math.floor(y / (menu.height/2));
	                
	                // Display the choice
	                // choiseLabel.text = 'You press: ' + choisemap[choise];
	                switch (choise){
	                case 0:
	                	this.state.start('MainMenu');
	                	break;
	                case 1:
	                	settings = this.add.sprite(this.camera.width/2, this.camera.height/2, 'settings');
	        	        settings.anchor.setTo(0.5, 0.5);
                                settings.fixedToCamera = true;
	                }
	            }
	            else{
	                // Remove the menu and the label
	                menu.destroy();
	                choiseLabel.destroy();
	
	                // Unpause the game
	                this.paused = false;
	            }
	        }
	    }
    },

    update: function () {
        // Honestly, just about anything could go here. It's YOUR game after
		// all. Eat your heart out!
    }, 

    render: function() {
        network.render(this);
        this.game.debug.cameraInfo(this.camera, 300, 32);
    }
};


