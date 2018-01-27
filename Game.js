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
        this.id = id;
        this.idText = state.add.text(x, y, id, { font: '15px Arial', fill: '#ffffff' });
        this.children = {};
        this.activePath = null;
        this.state = state;

        this.selectChild = function(id) {
            if (id in this.children) {
                this.activePath = this.children[id];
                console.log(this.id + ' redirecting to ' + id);
            } else {
                console.log(this.id + ' -!>' + id);
            }
        }

        this.addChild = function(node) {
            this.children[node.id] = node;
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
        this.nodes = {};
        this.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

        var nodeDistanceX = 64;
        var nodeDistanceY = 96;

        // Create nodes
        var index = 0;
        for (var i = 0; i < layers.length; ++i) {
            var nodeCount = layers[i];
            for (var j = 0; j < nodeCount; ++j, ++index) {
                var offset = 0.0;
                if (nodeCount % 2 == 0)
                    offset = -0.5;

                var x = state.world.width / 2 - (nodeDistanceX * (offset + Math.floor(nodeCount / 2))) + j * nodeDistanceX;
                var y = state.world.height / 2 + i * nodeDistanceY;
                var id = this.alphabet[index];
                this.nodes[id] = new Node(x, y, id, state);
            }
        }

        // Create paths

        var graphics = state.add.graphics(0, 0);
        
        index = 0;
        for (var i = 0; i < layers.length - 1; ++i) {
            var nodeCount = layers[i];
            for (var j = 0; j < nodeCount; ++j, ++index) {
                for (var k = 0; k < layers[i + 1]; ++k) {
                    var childIndex = index - j + nodeCount + k;
                    var child = this.nodes[this.alphabet[childIndex]];
                    var node = this.nodes[this.alphabet[index]];

                    if (child !== undefined) {
                        node.addChild(child);

                        graphics.beginFill(0xff0000);
                        graphics.lineStyle(2, 0xff0000, 1);
                        graphics.moveTo(node.x, node.y);
                        graphics.lineTo(child.x, child.y);
                    }
                }
            }
        }
        graphics.endFill();
        var camX = state.world.width / 2;
        var camY = state.world.height - 1.5 * (state.camera.height - 64);
        var sprite = state.add.sprite(camX, camY, graphics.generateTexture());
        sprite.anchor.setTo(0.5, 0.5);
        graphics.destroy();


        // Select paths
        var index = 0;
        for (var i = 0; i < layers.length - 1; ++i) {
            var nodeCount = layers[i];
            for (var j = 0; j < nodeCount; ++j, index++) {
                var childOffset = state.rnd.between(0, layers[i + 1]- 1);
                var childIndex = index - j + nodeCount + childOffset;
                this.nodes[this.alphabet[index]].selectChild(this.alphabet[childIndex]);
            }
        }

        this.redirect = function(aId, bId) {
            var nodeA = this.nodes[aId];
            var nodeB = nodeA.children[bId];
            if (nodeA !== undefined && nodeB !== undefined) {
                nodeA.selectChild(bId);
                return true;
            } else {
                return false;
            }
        }
    }
}

class Terminal {
    /*
    * Phaser.State state: Use 'this'
    */
    constructor(state) {
        this.state = state;
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
            } else if (cmd[0] === 'redirect' && cmd.length > 2) {
                if (this.state.network.redirect(cmd[1], cmd[2])) {
                    this.buffer.setText(this.buffer.text + '\n' + 'Redirected traffic from ' + cmd[1] + ' to ' + cmd[2]);
                } else {
                    this.buffer.setText(this.buffer.text + '\n' + 'Cannot redirect traffic from ' + cmd[1] + ' to ' + cmd[2]);
                }
            } else if (cmd[0] === 'path' && cmd.length > 1) {
                var node = this.state.network.nodes[cmd[1]];
                if (node !== undefined) {
                    this.buffer.setText(this.buffer.text + '\n' + node.id + ' currently redirects traffic to ' + node.activePath.id);
                } else {
                    this.buffer.setText(this.buffer.text + '\n' + 'No node with id ' + node.id + '!');
                }
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
BasicGame.Game = function (game) {

    // When a State is added to Phaser it automatically has the following
    // properties set on it, even if they already exist:

    this.game;      // a reference to the currently running game (Phaser.Game)
    this.add;       // used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    // a reference to the game camera (Phaser.Camera)
    this.cache;     // the game cache (Phaser.Cache)
    this.input;     // the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      // for preloading assets (Phaser.Loader)
    this.math;      // lots of useful common math operations (Phaser.Math)
    this.sound;     // the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     // the game stage (Phaser.Stage)
    this.time;      // the clock (Phaser.Time)
    this.tweens;    // the tween manager (Phaser.TweenManager)
    this.state;     // the state manager (Phaser.StateManager)
    this.world;     // the game world (Phaser.World)
    this.particles; // the particle manager (Phaser.Particles)
    this.physics;   // the physics manager (Phaser.Physics)
    this.rnd;       // the repeatable random number generator


    this.network;
    this.view = 0; // 0 = terminal, 1 = map
    this.switch = function() {
        if (this.view == 0) {
            this.camera.y = this.world.height - 2 * (this.camera.height - 32);
            this.view = 1;
        } else {
            this.camera.y = this.world.height - this.camera.height;
            this.view = 0;
        }
    };
};

BasicGame.Game.prototype = {
    
    create: function () {
        // Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

        // Camera origin: upper-left
        this.camera.setSize(640, 480);
        this.world.resize(this.camera.width * 3, this.camera.height * 3);
        this.camera.setPosition((this.world.width - this.camera.width) / 2, this.world.height - this.camera.height);
        terminal = new Terminal(this);
        this.network = new Network([3, 4, 2], this);

        console.log(this.network);

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
    
            // And a label to illustrate which menu item was chosen. (This is not necessary)
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
                    // The choicemap is an array that will help us see which item was clicked
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
                } else{
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
        // Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
    }, 

    render: function() {
        this.game.debug.cameraInfo(this.camera, 300, 32);
    }
};


