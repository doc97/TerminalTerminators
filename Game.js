class Packet {
    /*
     * integer id: Packet id
     * Node spawnNode: The node the packet spawns at
     * Node goal: The node the packet is supposed to get to
     * Network network: Reference to the Network
     * Phaser.State state: Use 'this'
     */
    constructor(id, spawnNode, goalNode, network, state) {
        this.id = id;
        this.goalNode = goalNode;
        this.network = network;
        this.state = state;
        this.x = spawnNode.x;
        this.y = spawnNode.y;
        this.src = spawnNode;
        this.dest = spawnNode.activePath;
        this.distX = this.dest.x - this.src.x;
        this.distY = this.dest.y - this.src.y;
        this.progressSpeed = 0.05;
        this.progress = 0;
        this.stepEvent;

        this.sprite = state.layer2.create(this.x, this.y, 'virus');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.destText = new Phaser.Text(state.game, this.x, this.y, this.goalNode.id, { font: 'Arial 15px', fill: '#000000' });
        this.destText.anchor.setTo(0.5, 0.5);
        state.layer3.add(this.destText);

        this.step = function() {
            this.progress += this.progressSpeed;
            if (this.progress >= 1) {
                if (this.dest === this.goalNode) {
                    // Success
                    this.destroy();
                    return;
                } else if (this.dest.activePath == null) {
                    // What happened???
                    console.log('Fail!');
                    this.destroy();
                    return;
                } else {
                    this.progress = this.progressSpeed;
                    this.src = this.dest;
                    this.dest = this.src.activePath;
                    this.distX = this.dest.x - this.src.x;
                    this.distY = this.dest.y - this.src.y;
                }
            }

            this.x = this.src.x + this.distX * this.progress;
            this.y = this.src.y + this.distY * this.progress;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.destText.x = this.x;
            this.destText.y = this.y;
        }

        this.destroy = function() {
            delete this.network.packets[id];
            this.sprite.destroy();
            this.destText.destroy();
            this.state.time.events.remove(this.stepEvent);
        }

        // Start spawn sequence
        this.stepEvent = state.time.events.loop(Phaser.Timer.SECOND, this.step, this);
    }
}

class Attacker {
    /*
     * Network network: Reference to the Network Phaser.State state: Use 'this'
     */
    constructor(network, state) {
        this.network = network;
        this.state = state;
        this.spawnDelaySec = 15.0;
        this.spawnCount = 0; 

        this.spawn = function() {
            var spawnIndex = this.state.rnd.between(0, this.network.spawnNodeCount - 1);
            var goalIndex = this.state.rnd.between(this.network.nodeCount - this.network.goalNodeCount, this.network.nodeCount - 1);
            var spawnNode = this.network.nodeAt(spawnIndex);
            var goalNode = this.network.nodeAt(goalIndex);
            var id = this.network.nextId();
            this.network.packets.push(new Packet(id, spawnNode, goalNode, this.network, this.state));
            this.state.time.events.add(this.spawnDelaySec * Phaser.Timer.SECOND, this.spawn, this);

            this.spawnCount++;
            if (this.spawnCount >= 5) {
                this.spawnCount = 0;
                this.spawnDelaySec *= 0.9;
            }
        };

        this.start = function() {
            this.state.time.events.add(Phaser.Timer.SECOND, this.spawn, this);
            console.log('Start attack');
        }
    }
}

class Node {
    /*
     * integer x: X-position in world coordinates integer y: Y-position in world
     * coordinates string id: The character displayed on the node Phaser.State
     * state: Use 'this'
     */
    constructor(x, y, id, state) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.children = {};
        this.activePath = null;
        this.isTrap = false;
        this.state = state;
        this.idText = new Phaser.Text(state.game, x, y, id, { font: '15px Arial', fill: '#ffffff' });
        state.layer1.add(this.idText);

        this.trap = function() {
            this.isTrap = true;
        }

        this.free = function() {
            this.isTrap = false;
        }

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
            this.idText.destroy();
        };
    }
}

class Network {
    /*
     * integer[] layers: Amount of nodes per layers Phaser.State state: Use
     * 'this'
     */
    constructor(layers, state) {
        this.MAX_TRAP_COUNT = 2;
        this.trapCount = 0;
        this.curId = 0;
        this.nodeCount = 0;
        this.spawnNodeCount = layers[0];
        this.goalNodeCount = layers[layers.length - 1];
        this.packets = [];
        this.nodes = {};
        this.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

        var nodeDistanceX = 128;
        var nodeDistanceY = 96;

        // Create nodes
        var index = 0;
        var offsetY = 0.0;
        if (layers.length % 2 == 0)
            offsetY = -0.5;

        for (var i = 0; i < layers.length; ++i) {
            var count = layers[i];
            for (var j = 0; j < count; ++j, ++index) {
                var offsetX = 0.0;
                if (count % 2 == 0)
                    offsetX = -0.5;

                var x = state.world.width / 2 - (nodeDistanceX * (offsetX + Math.floor(count / 2))) + j * nodeDistanceX;
                var y = state.camY1 + state.camera.height / 2 - (nodeDistanceY * (offsetY + Math.floor(layers.length / 2))) + i * nodeDistanceY;
                var id = this.alphabet[index];
                this.nodes[id] = new Node(x, y, id, state);
            }
        }
        this.nodeCount = index;

        // Create paths

        var camX = state.camera.x;
        var camY = state.camera.y;
        var graphics = state.add.graphics(camX, camY);
        
        index = 0;
        for (var i = 0; i < layers.length - 1; ++i) {
            var count = layers[i];
            for (var j = 0; j < count; ++j, ++index) {
                for (var k = 0; k < layers[i + 1]; ++k) {
                    var childIndex = index - j + count + k;
                    var child = this.nodes[this.alphabet[childIndex]];
                    var node = this.nodes[this.alphabet[index]];

                    if (child !== undefined) {
                        node.addChild(child);

                        graphics.beginFill(0xff0000);
                        graphics.lineStyle(2, 0xff0000, 1);
                        graphics.moveTo(node.x - camX, node.y - camY);
                        graphics.lineTo(child.x - camX, child.y - camY);
                    }
                }
            }
        }
        graphics.endFill();
        var spriteX = state.world.width / 2;
        var spriteY = state.camY1 + state.camera.height / 2;
        var sprite = state.layer0.create(spriteX, spriteY, graphics.generateTexture());
        sprite.anchor.setTo(0.5, 0.5);
        graphics.destroy();


        // Select paths
        var index = 0;
        for (var i = 0; i < layers.length - 1; ++i) {
            var count = layers[i];
            for (var j = 0; j < count; ++j, index++) {
                var childOffset = state.rnd.between(0, layers[i + 1]- 1);
                var childIndex = index - j + count + childOffset;
                this.nodes[this.alphabet[index]].selectChild(this.alphabet[childIndex]);
            }
        }

        this.nextId = function() {
            return this.curId++;
        };

        this.nodeAt = function(index) {
            return this.nodes[this.alphabet[index]];
        }

        this.redirect = function(aId, bId) {
            var nodeA = this.nodes[aId];
            if (nodeA == null)
                return false;

            var nodeB = nodeA.children[bId];
            if (nodeA != null && nodeB != null) {
                nodeA.selectChild(bId);
                return true;
            } else {
                return false;
            }
        }

        this.trap = function(nodeId) {
            var node = this.nodes[nodeId];
            if (this.trapCount === this.MAX_TRAP_COUNT) {
                return false;
            }

            if (node !== undefined) {
                this.trapCount++;
                node.trap();
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
        this.cmdStack = [];
        this.stackIndex = 0;
        this.curCmd = '$ ';
        this.command = state.add.text(state.camera.x + 16, state.camera.y + state.camera.height - 32, '$ ', { font: '15px Arial', fill: '#ffffff' });
        this.buffer = state.add.text(state.camera.x + 16, state.camera.y + state.camera.height - 32, '', { font: '15px Arial', fill: '#ffffff' });
        this.buffer.anchor.setTo(0, 1);

        state.input.keyboard.addCallbacks(this, null, null, function(ch) {
            this.curCmd = this.command.text + ch;
            this.command.setText(this.curCmd, true);
        });

        this.enterKey = state.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(function() {
            var cmdStr = this.command.text.substring(2, this.command.text.length);
            var cmd = cmdStr.split(' ');

            this.command.setText('$ ', true);

            if (cmd[0] === 'clear') {
                this.buffer.setText('');
            } else if (cmd[0] === 'print' && cmd.length > 1) {
                this.buffer.setText(this.buffer.text + '\n' + cmd[1]);
            } else if (cmd[0] === 'trap' && cmd.length > 1) {
                if (this.state.network.trap(cmd[1])) {
                    this.buffer.setText(this.buffer.text + '\n' + 'Successfully trapped node ' + cmd[1]);
                } else {
                    this.buffer.setText(this.buffer.text + '\n' + 'Cannot trap node ' + cmd[1]);
                }
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
                this.buffer.setText(this.buffer.text + '\n' + cmdStr + ': command not found');
            }

            if (this.cmdStack.length >= 3)
                this.cmdStack.shift();
            this.cmdStack.push(cmdStr);
            this.stackIndex = this.cmdStack.length;
            this.curCmd = '$ ';
        }, this);

        this.backspaceKey = state.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
        this.backspaceKey.onDown.add(function() {
            if (this.command.text.length > 2) {
                this.command.setText(this.command.text.substring(0, this.command.text.length - 1));
            }
        }, this);

        this.upKey = state.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.upKey.onDown.add(function() {
            this.stackIndex--;
            if (this.stackIndex < 0)
                this.stackIndex = 0;

            if (this.stackIndex < this.cmdStack.length && this.stackIndex >= 0)
                this.command.setText('$ ' + this.cmdStack[this.stackIndex]);
        }, this);

        this.downKey = state.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.downKey.onDown.add(function() {
            this.stackIndex++;
            if (this.stackIndex > this.cmdStack.length)
                this.stackIndex = this.cmdStack.length;

            if (this.stackIndex < this.cmdStack.length && this.stackIndex >= 0)
                this.command.setText('$ ' + this.cmdStack[this.stackIndex]);
            else if (this.stackIndex == this.cmdStack.length)
                this.command.setText(this.curCmd, true);
        }, this);


        this.destroy = function() {
            this.command.destroy();
            this.buffer.destroy();
            this.enterKey.destroy();
            this.backspaceKey.destroy();
        };
    }
}

/* Pause menu */
class PauseMenu {
    constructor(state) {
        this.create = function() {
            console.log('Create menu');
            this.state = state;
            this.menu;
            // Create a label to use as a button
            this.pauseButton = state.add.button(state.camera.width - 70, 40, 'pauseButton', function(str) {
                // When the pause button is pressed, we pause the game
                this.state.paused = true;
        
                // Then add the menu
                this.menu = this.state.add.sprite(this.state.camera.width / 2, this.state.camera.height / 2, 'menu');
                this.menu.anchor.setTo(0.5, 0.5);
                this.menu.fixedToCamera = true;
        
                // And a label to illustrate which menu item was chosen. (This
				// is not necessary)
                this.choiseLabel = this.state.add.text(this.state.camera.width / 2, 30, 'Click outside to continue', { font: '30px Arial', fill: '#ffffff' });
                this.choiseLabel.anchor.setTo(0.5, 0.5);
                this.choiseLabel.fixedToCamera = true;
            }, this);
            this.pauseButton.anchor.setTo(0.5, 0.5);
            this.pauseButton.fixedToCamera = true;
            
        
            // And finally the method that handels the pause menu
            this.unpause = function(event) {
                // Only act if paused
                if (this.state.paused) {
                    // Calculate the corners of the menu
                		var x1 = this.state.camera.width / 2 - this.menu.width / 2 , x2 = this.state.camera.width / 2 + this.menu.width / 2;
                        var y1 = this.state.camera.height / 2 - this.menu.height / 2, y2 = this.state.camera.height / 2 + this.menu.height / 2;
        
                    // Check if the click was inside the menu
                    if (event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ) {
                        // The choicemap is an array that will help us see which
						// item was clicked
                        var choisemap = ['one', 'two', 'three', 'four'];
        
                        // Get menu local coordinates for the click
                        var x = event.x - x1,
                            y = event.y - y1;
                       
                        // Calculate the choice
                        var choise = Math.floor(x / (this.menu.width / 2)) + 2 * Math.floor(y / (this.menu.height / 2));
                        
                        // Display the choice
                        // choiseLabel.text = 'You press: ' + choisemap[choise];
                        switch (choise) {
                            case 0:
                                this.menu.destroy();
                                this.choiseLabel.destroy();
                                this.state.state.start('MainMenu');
                                this.state.sound.stopAll();
        	                	break;
        	                case 1:
        	                	if (this.state.sound.mute === false){
        	                		this.state.sound.pauseAll();
        	                		this.state.sound.mute = true;
        	                	} else{
        	                		this.state.sound.resumeAll();
        	                		this.state.sound.mute = false;
        	                	}
                                
                        }
                    } else {
                        // Remove the menu and the label
                        this.menu.destroy();
                        this.choiseLabel.destroy();
        
                        // Unpause the game
                        this.state.paused = false;
                    }
                }
            };

            // Add a input listener that can help us return from being paused
            state.input.onDown.add(this.unpause, this);
        };
    }
}


/* Game code */
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
    
    this.paused = false;
    this.network;
    this.view = 0; // 0 = terminal, 1 = map
    this.switch = function() {
        if (this.view == 0) {
            this.camera.y = this.camY1;
            this.view = 1;
        } else {
            this.camera.y = this.camY0;
            this.view = 0;
        }
    };
};

BasicGame.Game.prototype = {
    
    create: function () {
        // Honestly, just about anything could go here. It's YOUR game after
		// all. Eat your heart out!
    	// Music stuff
    	this.sound.play('track1');
    	var mute = false;
    	
    	// Camera origin: upper-left
    	
    	
        this.camera.setSize(640, 480);
        this.world.resize(this.camera.width * 3, this.camera.height * 3);
        this.camera.setPosition((this.world.width - this.camera.width) / 2, this.world.height - this.camera.height);
        this.camY0 = this.world.height - this.camera.height;
        this.camY1 = this.world.height - 2 * (this.camera.height - 32);

        this.layer0 = this.add.group();
        this.layer1 = this.add.group();
        this.layer2 = this.add.group();
        this.layer3 = this.add.group();

        terminal = new Terminal(this);
        this.network = new Network([3, 4, 4, 4], this);
        attacker = new Attacker(this.network, this);
        attacker.start();

        console.log(this.network);

        tabKey = this.input.keyboard.addKey(Phaser.Keyboard.TAB);
        tabKey.onDown.add(this.switch, this);

        
        if (this.pauseMenu == null)
            this.pauseMenu = new PauseMenu(this);
        this.pauseMenu.create();
	    
    }   
}
