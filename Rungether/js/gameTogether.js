
/**
 *
 * RUNGETHER
 * ----
 * Computer Graphics Term Project
 * 201735894 ������ _ llodhigh@gmail.com
 * 201935046 �ڼ��� _ wlqkr23_@naver.com
 * 201935120 ��ä�� _ lcu1027@naver.com 
 * 201935139 ä���� _ ksh06293@naver.com
 * 
 *
 */

/**
 * Constants used in this game.
 */
var Colors = {
   cherry: 0xe35d6a,
   blue: 0x1560bd,
   white: 0xd8d0d1,
   black: 0x000000,
   brown: 0x654321,
   peach: 0xffdab9,
   yellow: 0xffff00,
   olive: 0x556b2f,
   grey: 0x696969,
   sand: 0x835c3b,
   brownDark: 0x23190f,
   green: 0x669900,
   pink:0xfcbacb,
};

var deg2Rad = Math.PI / 180;


var cameraX = -1100;
var cameraY = 1800;
var cameraZ = 0;

var runningCharacter;
var runningaction;
var runningCharacter2;
var runningaction2;
// Make a new world when the page is loaded.
window.addEventListener('load', function(){
   new World();
});

/** 
 *
 * THE WORLD
 * 
 * The world in which Boxy Run takes place.
 *
 */

/** 
  * A class of which the world is an instance. Initializes the game
  * and contains the main game loop.
  *
  */
function World() {


   // Explicit binding of this even in changing contexts.
   var self = this;

   // Scoped variables in this world.
   var element, scene, camera, character, renderer, light,
      objects, objects2, paused, paused2, keysAllowed, score, score2, difficulty,
      treePresenceProb, maxTreeSize, fogDistance, gameOver, gameOver2;
	
	var clock = new THREE.Clock();
    var mixer = new THREE.AnimationMixer(scene);
    var mixer2 = new THREE.AnimationMixer(scene);
   // Initialize the world.
   init();
   
   /**
     * Builds the renderer, scene, lights, camera, and the character,
     * then begins the rendering loop.
     */
   function init() {

      // Locate where the world is to be located on the screen.
      element = document.getElementById('world');

      // Initialize the renderer.
      renderer = new THREE.WebGLRenderer({
         alpha: true,
         antialias: true
      });
      renderer.setSize(element.clientWidth, element.clientHeight);
      renderer.shadowMap.enabled = true;
      element.appendChild(renderer.domElement);

      // Initialize the scene.
      scene = new THREE.Scene();
      fogDistance = 40000;
      scene.fog = new THREE.Fog(0xbadbe4, 1, fogDistance);


      // Initialize the camera with field of view, aspect ratio,
      // near plane, and far plane.
      camera = new THREE.PerspectiveCamera(
         60, element.clientWidth / element.clientHeight, 1, 120000);


      camera.position.set(0, 1200, 0);
      camera.lookAt(new THREE.Vector3(0, 600, -5000));
      window.camera = camera;

      // Set up resizing capabilities.
      window.addEventListener('resize', handleWindowResize, false);

      // Initialize the lights.
      light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
      scene.add(light);

      // Initialize the character and add it to the scene.
      character = new rCharacter();
 
      character2 = new rCharacter2();
      
      ground = new Ground();
        scene.add(ground.element);

      //var ground2 = createBox(2400, 20, 120000, Colors.grey, -2500, -400, -60000);
     // scene.add(ground2);

		const loader = new THREE.GLTFLoader();
		loader.load('./model2/scene.gltf', function(gltf){
		  running = gltf.scene.children[0];
		  running.scale.set(600,-800,500);
		  running.position.set(-2500,0,-4000);
		  scene.add(gltf.scene);
		  runningCharacter = running;
		  mixer = new THREE.AnimationMixer( gltf.scene );
		  var action = mixer.clipAction( gltf.animations[ 0 ] );
		  runningaction = action;
		  }, undefined, function (error) {
			console.error(error);
		});
		
		const loader2 = new THREE.GLTFLoader();
		loader.load('./model/scene.gltf', function(gltf){
		  running2 = gltf.scene.children[0];
		  running2.scale.set(600,-800,500);
		  running2.position.set(0,0,-4000);
		  scene.add(gltf.scene);
		  runningCharacter2 = running2;
		  mixer2 = new THREE.AnimationMixer( gltf.scene );
		  var action = mixer2.clipAction( gltf.animations[ 0 ] );
		  runningaction2 = action;
		  }, undefined, function (error) {
			console.error(error);
		});
	  
      objects = [];
	  objects2 = [];
      treePresenceProb = 0.2;
      maxTreeSize = 0.7;

      for (var i = 10; i <40; i++) {
         createRowOfTrees(i * -3000, treePresenceProb, 0.6, maxTreeSize);
      }

      // The game is paused to begin with and the game is not over.
      gameOver = false;
	  gameOver2 = false;
      paused = true;
	  paused2 = true;
      // Start receiving feedback from the player.
      var left = 37;
      var up = 38;
      var right = 39;
      var p = 80;

      var w = 87;
      var a = 65;
      var s = 83;
      var d = 68;
      var q = 81;
      var ee = 69;
      
      keysAllowed = {};
      document.addEventListener(
         'keydown',
         function(e) {
            if (!gameOver || !gameOver2) {
               var key = e.keyCode;
               if (keysAllowed[key] === false) return;
               keysAllowed[key] = false;
               if (paused && paused2 && !character1CollisionsDetected() && !character2CollisionsDetected() && key == 13) { //13==enter
                  paused = false;
				  paused2 = false;
                  character.onUnpause();
                  character2.onUnpause();
                  document.getElementById(
                     "variable-content").style.visibility = "hidden";
                  document.getElementById(
                     "controls").style.display = "none";
                  document.getElementById(
                     "variable-content2").style.visibility = "hidden";
                  document.getElementById(
                     "controls2").style.display = "none";
               } 
			   else {
                  if (key == p) {
                     paused = true;
					 paused2 = true;
                     character.onPause();
                     character2.onPause();
                     document.getElementById(
                        "variable-content").style.visibility = "visible";
                     document.getElementById(
                        "variable-content").innerHTML = 
                        "Game is paused. Press enter to resume.";
					 document.getElementById(
                        "variable-content2").style.visibility = "visible";
                     document.getElementById(
                        "variable-content2").innerHTML = 
                        "Game is paused. Press enter to resume.";
                  }
                  if (key == w && !paused ) {
                     character.onUpKeyPressed();
                  }
                  if (key == a && !paused  ) {
                     character.onLeftKeyPressed();
                  }
                  if (key == d && !paused  ) {
                     character.onRightKeyPressed();
                  }
                  if (key == up && !paused2 ) {
                     character2.onUpKeyPressed();
                  }
                  if (key == left && !paused2 ) {
                     character2.onLeftKeyPressed();
                  }
                  if (key == right && !paused2 ) {
                     character2.onRightKeyPressed();
                  }

                  //camera position setting
                  if (key == w && paused && paused2 ) {
                     character.onWKeyPressed();
                     character2.onWKeyPressed();
                  }
                  if (key == s && paused && paused2 ) {
                     character.onSKeyPressed();
                     character2.onSKeyPressed();
                  }
                  if (key == a && paused && paused2 ) {
                     character.onAKeyPressed();
                     character2.onAKeyPressed();
                  }
                  if (key == d && paused && paused2 ) {
                     character.onDKeyPressed();
                     character2.onDKeyPressed();
                  }
                  if (key == q && paused && paused2 ) {
                     character.onQKeyPressed();
                     character2.onQKeyPressed();
                  }
                  if (key == ee && paused && paused2 ) {
                     character.onEKeyPressed();
                     character2.onEKeyPressed();
                  }
                  if (key == 49 && paused && paused2 ) {
                     character.on1KeyPressed();
                     character2.on1KeyPressed();
                  }
                  if (key == 50 && paused && paused2 ) {
                     character.on2KeyPressed();
                     character2.on2KeyPressed();
                  }
                  if (key == 51 && paused && paused2 ) {
                     character.on3KeyPressed();
                     character2.on3KeyPressed();
                  }
                  if (key == 52 && paused && paused2 ) {
                     character.on4KeyPressed();
                     character2.on4KeyPressed();
                  }
                  if (key == 53 && paused && paused2 ) {
                     character.on5KeyPressed();
                     character2.on5KeyPressed();
                  }
               }
            }
         }
      );

      document.addEventListener(
         'keyup',
         function(e) {
            keysAllowed[e.keyCode] = true;
         }
      );
      document.addEventListener(
         'focus',
         function(e) {
            keysAllowed = {};
         }
      );

      // Initialize the scores and difficulty.
      score = 0;
	  score2 = 0;
      difficulty = 0;
      document.getElementById("score").innerHTML = score;
      document.getElementById("score2").innerHTML = score2;

	  // Initialize the motionValue and out of groud
        motionValue = -60;
        out = false;
        out2 = false;
		
      // Begin the rendering loop.
      loop();
	
   }
   
   /**
     * The main animation loop.
     */
   function loop() {
      // Update the game.
      if (!paused || !paused2 ) {
         // Add more trees and increase the difficulty.
         if ((objects[objects.length - 1].mesh.position.z) % 2400 == 0 && !paused) 
		 {
            difficulty += 1;
            var levelLength = 30;
            if (difficulty % levelLength == 0) {
               var level = difficulty / levelLength;
               switch (level) {
                  case 1:
                     treePresenceProb = 0.35;
                     maxTreeSize = 0.7;
                     break;
                  case 2:
                     treePresenceProb = 0.35;
                     maxTreeSize = 0.85;
                     break;
                  case 3:
                     treePresenceProb = 0.5;
                     maxTreeSize = 0.85;
                     break;
                  case 4:
                     treePresenceProb = 0.5;
					maxTreeSize = 1.1;
                     break;
                  case 5:
                     treePresenceProb = 0.5;
					maxTreeSize = 1.1;
                     break;
                  case 6:
                     treePresenceProb = 0.55;
					maxTreeSize = 1.1;
                     break;
                  default:
                     treePresenceProb = 0.55;
                     maxTreeSize = 1.25;
               }
            }
            if ((difficulty >= 5 * levelLength && difficulty < 6 * levelLength)) {
               fogDistance -= (25000 / levelLength);
            } else if (difficulty >= 8 * levelLength && difficulty < 9 * levelLength) {
               fogDistance -= (5000 / levelLength);
            }

            createRowOfTrees(-120000, treePresenceProb, 0.6, maxTreeSize);
            
            scene.fog.far = fogDistance;
         }

		 if (paused) { //if player 1 is dead	
                if ((objects2[objects2.length - 1].mesh.position.z) % 2400 == 0) {
                    difficulty += 1;
                    var levelLength = 30;
                    if (difficulty % levelLength == 0) {
                        var level = difficulty / levelLength;
                        switch (level) {
                            case 1:
                                treePresenceProb = 0.35;
                                maxTreeSize = 1.0;
                                break;
                            case 2:
                                treePresenceProb = 0.35;
                                maxTreeSize = 1.0;
                                break;
                            case 3:
                                treePresenceProb = 0.5;
                                maxTreeSize = 1.2;
                                break;
                            case 4:
                                treePresenceProb = 0.5;
                                maxTreeSize = 1.3;
                                break;
                            case 5:
                                treePresenceProb = 0.5;
                                maxTreeSize = 1.3;
                                break;
                            case 6:
                                treePresenceProb = 0.55;
                                maxTreeSize = 1.3;
                                break;
                            default:
                                treePresenceProb = 0.55;
                                maxTreeSize = 1.5;
                        }
                    }
                    if ((difficulty >= 5 * levelLength && difficulty < 6 * levelLength)) {
                        fogDistance -= (25000 / levelLength);
                    } else if (difficulty >= 8 * levelLength && difficulty < 9 * levelLength) {
                        fogDistance -= (5000 / levelLength);
                    }

                    createRowOfTrees(-120000, treePresenceProb, 0.6, maxTreeSize);

                    scene.fog.far = fogDistance;
                }
            }

			ground.update();


		 if (motionValue >= -60 && motionValue < 0) {
                if (character.currentLane <= -5 || character.currentLane >= 0)
                    out = true;
                if (character2.currentLane <= -2 || character2.currentLane >= 2)
                    out2 = true;
            }

            // Give motion to the ground
            if (motionValue >= 0 && motionValue < 10) {
                ground.onLeft();
				if (!gameOver) {
                    objects.forEach(function(object) {
                        object.mesh.position.x -= 10;
                    });
				}
			    if (!gameOver2) {
                    objects2.forEach(function(object) {
                        object.mesh.position.x -= 10;
                    });
				}  
                

                if (motionValue >= 6 && motionValue < 10) {
                    if (character2.currentLane >= 1) {
                        out2 = true;
                    }
                }

            }

            if (motionValue >= 10 && motionValue < 30) {
                ground.onRight();

				if (!gameOver) {
                    objects.forEach(function(object) {
                        object.mesh.position.x += 10;
                    });
				}
			    if (!gameOver2) {
                    objects2.forEach(function(object) {
                        object.mesh.position.x += 10;
                    });
				}  
                

                if (motionValue >= 10 && motionValue < 13) {
                    if (character2.currentLane >= 1) {
                        out2 = true;
                    }
                }
                if (motionValue >= 25 && motionValue < 30) {
                    if (character.currentLane <= -4) {
                        out = true;
                    }
                }
                if (motionValue >= 17 && motionValue < 20) {
                    if (character2.currentLane >= 1) {
                        out2 = true;
                    }

                }
                if (motionValue >= 28 && motionValue < 30) {
                    if (character.currentLane <= -4) {
                        out = true;
                    }
                }

            }

            if (motionValue >= 30 && motionValue < 40) {
                ground.onLeft();

				if (!gameOver) {
                    objects.forEach(function(object) {
                        object.mesh.position.x -= 10;
                    });
				}
			    if (!gameOver2) {
                    objects2.forEach(function(object) {
                        object.mesh.position.x -= 10;
                    });
				}     

                if (motionValue >= 30 && motionValue < 38) {
                    if (character.currentLane <= -4) {
                        out = true;
                    }
                }

                if (motionValue >= 39 && motionValue < 40) {
                    if (character2.currentLane >= 2) {
                        out2 = true;
                    }
                }
            }

            if (motionValue >= 40 && motionValue < 80) {
                if (character.currentLane <= -5 || character.currentLane >= 2)
                    out = true;
                if (character2.currentLane <= -5 || character2.currentLane >= 2)
                    out2 = true;
            }


            if (motionValue >= 80) {
                motionValue = 0;
            }
			
            if (!gameOver) {
                character.update();
                objects.forEach(function(object) {
                    object.mesh.position.z += 100;
                });
            }
            if (!gameOver2) {
                character2.update();
                objects2.forEach(function(object) {
                    object.mesh.position.z += 100;
                });
            }



		 
         // Remove trees that are outside of the world.
            objects = objects.filter(function(object) {
                return object.mesh.position.z < 0;
            });

            objects2 = objects2.filter(function(object) {
                return object.mesh.position.z < 0;
            });


            // Make the character move according to the controls.
			

            // Check for collisions between the character and objects.
            if (character1CollisionsDetected() || out) {
                gameOver = true;
                paused = true;
				runningaction.stop();

                if (gameOver2 == true) {
                    document.addEventListener(
                        'keydown',
                        function(e) {
                            if (e.keyCode == 13)
                                document.location.reload(true);
                        }
                    );
                }

                var variableContent = document.getElementById("variable-content");
                variableContent.style.visibility = "visible";
                if (gameOver2 == true) {
                    variableContent.innerHTML = "Press enter to try again !";

                } else {
                    variableContent.innerHTML =
                        "Game over! User2 WIN !";
                }
            }

          if (character2CollisionsDetected() || out2) {
                gameOver2 = true;
                paused2 = true;
				runningaction2.stop();
                if (gameOver == true) {
                    document.addEventListener(
                        'keydown',
                        function(e) {
                            if (e.keyCode == 13)
                                document.location.reload(true);
                        }
                    );
                }

                var variableContent = document.getElementById("variable-content2");
                variableContent.style.visibility = "visible";
                if (gameOver == true) {
                    variableContent.innerHTML = "Press enter to try again !";
                } else {
                    variableContent.innerHTML =
                        "Game over! User1 WIN !";
                }
            }

            // Update the scores.
            if (!gameOver) {
                // Update the motionValue
                motionValue += 0.1;
                score += 10;
                document.getElementById("score").innerHTML = score;
            }
            if (!gameOver2) {
                // Update the motionValue
                motionValue += 0.1;
                score2 += 10;
                document.getElementById("score2").innerHTML = score2;
            }

        }

      camera.position.set(cameraX, cameraY, cameraZ);
		var delta = clock.getDelta();
		if ( mixer ) mixer.update( delta );
		if ( mixer2 ) mixer2.update( delta );

      // Render the page and repeat.
      renderer.render(scene, camera);
      requestAnimationFrame(loop);

   } //end loop

   /**
     * A method called when window is resized.
     */
   function handleWindowResize() {
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.updateProjectionMatrix();
   }

   /**
    * Creates and returns a row of trees according to the specifications.
    *
    * @param {number} POSITION The z-position of the row of trees.
     * @param {number} PROBABILITY The probability that a given lane in the row
     *                             has a tree.
     * @param {number} MINSCALE The minimum size of the trees. The trees have a 
     *                     uniformly distributed size from minScale to maxScale.
     * @param {number} MAXSCALE The maximum size of the trees.
     *
    */
   function createRowOfTrees(position, probability, minScale, maxScale) {
      for (var lane = -1; lane < 2; lane++) {
         var randomNumber = Math.random();
         if (randomNumber < probability) {
         		var scale = minScale + (maxScale - minScale) * Math.random();
				var tree = new Tree(lane * 700, -400, position, scale); // right tree
				lane -= 3;
				var tree2 = new Tree(lane * 800, -400, position, scale); //left tree
				lane += 3;
				objects2.push(tree);
				objects.push(tree2);
				scene.add(tree.mesh);
				scene.add(tree2.mesh);	 
         }
      }
   }

   /**
    * Returns true if and only if the character is currently colliding with
    * an object on the map.
    */

   function character1CollisionsDetected() {

       var charMinX = runningCharacter.position.x - 115;
 		var charMaxX = runningCharacter.position.x + 115;
 		var charMinY = runningCharacter.position.y - 310;
 		var charMaxY = runningCharacter.position.y + 320;
 		var charMinZ = runningCharacter.position.z - 40;
 		var charMaxZ = runningCharacter.position.z + 40;
 		for (var i = 0; i < objects.length; i++) {
 			if (objects[i].collides(charMinX, charMaxX, charMinY, 
 					charMaxY, charMinZ, charMaxZ)) {
 				return true;
 			}
 		}
 		return false;
    }

    function character2CollisionsDetected() {
       var charMinX2 = runningCharacter2.position.x - 115;
       var charMaxX2 = runningCharacter2.position.x + 115;
       var charMinY2 = runningCharacter2.position.y - 320;
       var charMaxY2 = runningCharacter2.position.y + 320;
       var charMinZ2 = runningCharacter2.position.z - 40;
       var charMaxZ2 = runningCharacter2.position.z + 40;
       for (var i = 0; i < objects2.length; i++) {
          if (objects2[i].collides(charMinX2, charMaxX2, charMinY2, 
                charMaxY2, charMinZ2, charMaxZ2)) {
            return true;
         }
      }

      return false;

   }
}

function rCharacter() {

	// Explicit binding of this even in changing contexts.
	var self = this;

	// Character defaults that don't change throughout the game.

	this.jumpDuration = 0.6;
	this.jumpHeight = 2000;

	// Initialize the character.
	init();

	function init() {

		// Initialize the player's changing parameters.
		self.isJumping = false;
		self.isSwitchingLeft = false;
		self.isSwitchingRight = false;
		self.currentLane = -3;
		self.runningStartTime = new Date() / 1000;
		self.pauseStartTime = new Date() / 1000;
		self.stepFreq = 2;
		self.queuedActions = [];

	}
   



   /**
    * A method called on the character when time moves forward.
    */
   this.update = function() {

      // Obtain the curren time for future calculations.
      var currentTime = new Date() / 1000;

      // Apply actions to the character if none are currently being
      // carried out.
      if (!self.isJumping &&
         !self.isSwitchingLeft &&
         !self.isSwitchingRight &&
         self.queuedActions.length > 0) {
         switch(self.queuedActions.shift()) {
            case "up":
               self.isJumping = true;
               self.jumpStartTime = new Date() / 1000;
               break;
            case "left":
               if (self.currentLane != -5) {
                  self.isSwitchingLeft = true;
               }
               break;
            case "right":
               if (self.currentLane != -2) {
                  self.isSwitchingRight = true;
               }
               break;
         }
      }

      // If the character is jumping, update the height of the character.
      // Otherwise, the character continues running.
      if (self.isJumping) {
         var jumpClock = currentTime - self.jumpStartTime;
         runningCharacter.position.y = self.jumpHeight * Math.sin(
            (1 / self.jumpDuration) * Math.PI * jumpClock) +
            sinusoid(2 * self.stepFreq, 0, 20, 0,
               self.jumpStartTime - self.runningStartTime);
		 runningaction.stop();
         if (jumpClock > self.jumpDuration) {
            self.isJumping = false;
            self.runningStartTime += self.jumpDuration;
			runningaction.play();
         }
      } else {
         var runningClock = currentTime - self.runningStartTime;
         
         // If the character is not jumping, it may be switching lanes.
         if (self.isSwitchingLeft) {
			runningCharacter.position.x -= 200;
            var offset = self.currentLane * 800 - runningCharacter.position.x;
            if (offset > -800) {
               self.currentLane -= 1;
               runningCharacter.position.x = self.currentLane * 800;
               self.isSwitchingLeft = false;
            }

         }
         if (self.isSwitchingRight) {
            runningCharacter.position.x += 200;
            var offset = runningCharacter.position.x - self.currentLane * 800;
            if (offset > 800) {
               self.currentLane += 1;
               runningCharacter.position.x = self.currentLane * 800;
               self.isSwitchingRight = false;
            }
         }
      }
   }

   /**
     * Handles character activity when the left key is pressed.
     */
   this.onLeftKeyPressed = function() {
      self.queuedActions.push("left");
   }

   /**
     * Handles character activity when the up key is pressed.
     */
   this.onUpKeyPressed = function() {
      self.queuedActions.push("up");
   }

   /**
     * Handles character activity when the right key is pressed.
     */
   this.onRightKeyPressed = function() {
      self.queuedActions.push("right");
   }

   /**
     * Handles character activity when the game is paused.
     */
   this.onPause = function() {
      self.pauseStartTime = new Date() / 1000;
		runningaction.stop();
   }

   /**
     * Handles character activity when the game is unpaused.
     */
   this.onUnpause = function() {
      var currentTime = new Date() / 1000;
      var pauseDuration = currentTime - self.pauseStartTime;
      self.runningStartTime += pauseDuration;
	  runningaction.play();
      if (self.isJumping) {
         self.jumpStartTime += pauseDuration;
      }
   }
   this.onWKeyPressed = function() {
      cameraY += 200;
   };

   this.onSKeyPressed = function() {
      cameraY -= 200;
   };

   this.onAKeyPressed = function() {
      cameraX -= 200;
   };

   this.onDKeyPressed = function() {
      cameraX += 200;
   };

   this.onQKeyPressed = function() {
      cameraZ += 200;
   };

   this.onEKeyPressed = function() {
      cameraZ -= 200;
   };

   this.on1KeyPressed = function() {
      cameraX = -1200;
      cameraY = 500;
      cameraZ = -1500;

   };

   this.on2KeyPressed = function() {
      cameraX = -1000;
      cameraY = 3000;
      cameraZ = 3000;   
   };

   this.on3KeyPressed = function() {
      cameraX = -5000;
      cameraY = 3000;
      cameraZ = 3000;      
   };

   this.on4KeyPressed = function() {
      cameraX = 2500;
      cameraY = 3000;
      cameraZ = 3000;   
   };

   this.on5KeyPressed = function() {
      cameraX = -1100;
      cameraY = 1500;
      cameraZ = -1000;      
   };


}

function rCharacter2() {

	// Explicit binding of this even in changing contexts.
	var self = this;

	// Character defaults that don't change throughout the game.

	this.jumpDuration = 0.6;
	this.jumpHeight = 2000;

	// Initialize the character.
	init();

	function init() {

		// Initialize the player's changing parameters.
		self.isJumping = false;
		self.isSwitchingLeft = false;
		self.isSwitchingRight = false;
		self.currentLane = 0;
		self.runningStartTime = new Date() / 1000;
		self.pauseStartTime = new Date() / 1000;
		self.stepFreq = 2;
		self.queuedActions = [];

	}
   


   /**
    * A method called on the character when time moves forward.
    */
   this.update = function() {

      // Obtain the curren time for future calculations.
      var currentTime = new Date() / 1000;

      // Apply actions to the character if none are currently being
      // carried out.
      if (!self.isJumping &&
         !self.isSwitchingLeft &&
         !self.isSwitchingRight &&
         self.queuedActions.length > 0) {
         switch(self.queuedActions.shift()) {
            case "up":
               self.isJumping = true;
               self.jumpStartTime = new Date() / 1000;
               break;
            case "left":
               if (self.currentLane != -1) {
                  self.isSwitchingLeft = true;
               }
               break;
            case "right":
               if (self.currentLane != 2) {
                  self.isSwitchingRight = true;
               }
               break;
         }
      }

      // If the character is jumping, update the height of the character.
      // Otherwise, the character continues running.
      if (self.isJumping) {
         var jumpClock = currentTime - self.jumpStartTime;
         runningCharacter2.position.y = self.jumpHeight * Math.sin(
            (1 / self.jumpDuration) * Math.PI * jumpClock) +
            sinusoid(2 * self.stepFreq, 0, 20, 0,
               self.jumpStartTime - self.runningStartTime);
		 runningaction2.stop();
         if (jumpClock > self.jumpDuration) {
            self.isJumping = false;
            self.runningStartTime += self.jumpDuration;
			runningaction2.play();
         }
      } else {
         var runningClock = currentTime - self.runningStartTime;
         

         // If the character is not jumping, it may be switching lanes.
         if (self.isSwitchingLeft) {
            runningCharacter2.position.x -= 200;

            var offset = self.currentLane * 800 - runningCharacter2.position.x;
            if (offset > -800) {
               self.currentLane -= 1;
               runningCharacter2.position.x = self.currentLane * 800;
               self.isSwitchingLeft = false;
            }

         }
         if (self.isSwitchingRight) {
            runningCharacter2.position.x += 200;
            var offset = runningCharacter2.position.x - self.currentLane * 800;
            if (offset > 800) {
               self.currentLane += 1;
               runningCharacter2.position.x = self.currentLane * 800;
               self.isSwitchingRight = false;
            }
         }
      }
   }

   /**
     * Handles character activity when the left key is pressed.
     */
   this.onLeftKeyPressed = function() {
      self.queuedActions.push("left");
   }

   /**
     * Handles character activity when the up key is pressed.
     */
   this.onUpKeyPressed = function() {
      self.queuedActions.push("up");
   }

   /**
     * Handles character activity when the right key is pressed.
     */
   this.onRightKeyPressed = function() {
      self.queuedActions.push("right");
   }

   /**
     * Handles character activity when the game is paused.
     */
   this.onPause = function() {
      self.pauseStartTime = new Date() / 1000;
      runningaction2.stop();
   }

   /**
     * Handles character activity when the game is unpaused.
     */
   this.onUnpause = function() {
      var currentTime = new Date() / 1000;
      var pauseDuration = currentTime - self.pauseStartTime;
	  runningaction2.play();
      self.runningStartTime += pauseDuration;
      if (self.isJumping) {
         self.jumpStartTime += pauseDuration;
      }
   }
   this.onWKeyPressed = function() {
      cameraY += 200;
   };

   this.onSKeyPressed = function() {
      cameraY -= 200;
   };

   this.onAKeyPressed = function() {
      cameraX -= 200;
   };

   this.onDKeyPressed = function() {
      cameraX += 200;
   };

   this.onQKeyPressed = function() {
      cameraZ += 200;
   };

   this.onEKeyPressed = function() {
      cameraZ -= 200;
   };

   this.on1KeyPressed = function() {
      cameraX = -1200;
      cameraY = 500;
      cameraZ = -1500;

   };

   this.on2KeyPressed = function() {
      cameraX = -1000;
      cameraY = 3000;
      cameraZ = 3000;   
   };

   this.on3KeyPressed = function() {
      cameraX = -5000;
      cameraY = 3000;
      cameraZ = 3000;      
   };

   this.on4KeyPressed = function() {
      cameraX = 2500;
      cameraY = 3000;
      cameraZ = 3000;   
   };

   this.on5KeyPressed = function() {
      cameraX = -1100;
      cameraY = 1500;
      cameraZ = -1000;      
   };

}


/**
  * A collidable tree in the game positioned at X, Y, Z in the scene and with
  * scale S.
  */
function Tree(x, y, z, s) {

   // Explicit binding.
   var self = this;

   // The object portrayed in the scene.
   this.mesh = new THREE.Object3D();
    var top = createTree(1, 300, 300, 4, Colors.white, 0, 1000, 0);
    var mid = createTree(1, 400, 400, 4, Colors.white, 0, 800, 0);
    var bottom = createTree(1, 500, 500, 4, Colors.white, 0, 500, 0);
    var trunk = createTrunk(100, 100, 250, 32, Colors.brown, 0, 125, 0);
    this.mesh.add(top);
    this.mesh.add(mid);
    this.mesh.add(bottom);
    this.mesh.add(trunk);
    this.mesh.position.set(x, y, z);
   this.mesh.scale.set(s, s, s);
   this.scale = s;

   /**
    * A method that detects whether this tree is colliding with the character,
    * which is modelled as a box bounded by the given coordinate space.
    */
    this.collides = function(minX, maxX, minY, maxY, minZ, maxZ) {
       var treeMinX = self.mesh.position.x - this.scale * 250;
       var treeMaxX = self.mesh.position.x + this.scale * 250;
       var treeMinY = self.mesh.position.y - this.scale * 1150;
       var treeMaxY = self.mesh.position.y + this.scale * 1150;
       var treeMinZ = self.mesh.position.z - this.scale * 250;
       var treeMaxZ = self.mesh.position.z + this.scale * 250;
       return treeMinX <= maxX && treeMaxX >= minX
          && treeMinY <= maxY && treeMaxY >= minY
          && treeMinZ <= maxZ && treeMaxZ >= minZ;
    }

}

/** 
 *
 * UTILITY FUNCTIONS
 * 
 * Functions that simplify and minimize repeated code.
 *
 */

/**
 * Utility function for generating current values of sinusoidally
 * varying variables.
 *
 * @param {number} FREQUENCY The number of oscillations per second.
 * @param {number} MINIMUM The minimum value of the sinusoid.
 * @param {number} MAXIMUM The maximum value of the sinusoid.
 * @param {number} PHASE The phase offset in degrees.
 * @param {number} TIME The time, in seconds, in the sinusoid's scope.
 * @return {number} The value of the sinusoid.
 *
 */
function sinusoid(frequency, minimum, maximum, phase, time) {
   var amplitude = 0.5 * (maximum - minimum);
   var angularFrequency = 2 * Math.PI * frequency;
   var phaseRadians = phase * Math.PI / 180;
   var offset = amplitude * Math.sin(
      angularFrequency * time + phaseRadians);
   var average = (minimum + maximum) / 2;
   return average + offset;
}

/**
 * Creates an empty group of objects at a specified location.
 *
 * @param {number} X The x-coordinate of the group.
 * @param {number} Y The y-coordinate of the group.
 * @param {number} Z The z-coordinate of the group.
 * @return {Three.Group} An empty group at the specified coordinates.
 *
 */


/**
 * Creates and returns a simple box with the specified properties.
 */

 function createGround(dx, dy, dz, map, x, y, z, notFlatShading) {

	const loader = new THREE.TextureLoader();

    const materials = [
    new THREE.MeshBasicMaterial({map: loader.load('https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=750&w=1260')}),
    new THREE.MeshBasicMaterial({map: loader.load('https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=750&w=1260')}),
    new THREE.MeshBasicMaterial({map: loader.load('https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=750&w=1260')}),
    new THREE.MeshBasicMaterial({map: loader.load('https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=750&w=1260')}),

  ];

    var geom = new THREE.BoxGeometry(dx, dy, dz);

    var box = new THREE.Mesh(geom, materials);

    box.castShadow = true;
    box.receiveShadow = true;
    box.position.set(x, y, z);
    return box;
}

function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({
      color:color, 
       flatShading: notFlatShading != true
    });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.set(x, y, z);
    return box;
}

/**
 * Creates and returns a (possibly asymmetrical) cyinder with the 
 * specified properties.
 *
 * @param {number} RADIUSTOP The radius of the cylinder at the top.
 * @param {number} RADIUSBOTTOM The radius of the cylinder at the bottom.
 * @param {number} HEIGHT The height of the cylinder.
 * @param {number} RADIALSEGMENTS The number of segmented faces around 
 *                                the circumference of the cylinder.
 * @param {color} COLOR The color of the cylinder.
 * @param {number} X The x-coordinate of the center of the cylinder.
 * @param {number} Y The y-coordinate of the center of the cylinder.
 * @param {number} Z The z-coordinate of the center of the cylinder.
 * @return {THREE.Mesh} A box with the specified properties.
 */
function createTree(radiusTop, radiusBottom, height, radialSegments, 
						map, x, y, z) {
	var loader = new THREE.TextureLoader();
    var geom = new THREE.CylinderGeometry(
    	radiusTop, radiusBottom, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({
	map: loader.load('tree.jpg'),
    	flatShading: true
    });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;
}

function createTrunk(radiusTop, radiusBottom, height, radialSegments, 
						map, x, y, z) {
	var loader = new THREE.TextureLoader();
    var geom = new THREE.CylinderGeometry(
    	radiusTop, radiusBottom, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({
		color:map,
    	flatShading: true
    });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;
}

function Ground() {

    var self = this;

    init();

    function init() {
        self.element = createGround(5000, 20, 120000, Colors.grey, -1100, -400, -60000);
        self.isSwitchingLeft = false;
        self.isSwitchingRight = false;
        self.queuedActions = [];
    }

    this.update = function() {

        if (!self.isSwitchingLeft &&
            !self.isSwitchingRight &&
            self.queuedActions.length > 0) {
            switch (self.queuedActions.shift()) {
                case "left":
                    self.isSwitchingLeft = true;
                    break;
                case "right":
                    self.isSwitchingRight = true;
                    break;
            }
        }

        if (self.isSwitchingLeft) {
            self.element.position.x -= 10;
            self.isSwitchingLeft = false;
        }
        if (self.isSwitchingRight) {
            self.element.position.x += 10;
            self.isSwitchingRight = false;
        }
    }

    this.onLeft = function() {
        self.queuedActions.push("left");
    }


    this.onRight = function() {
        self.queuedActions.push("right");
    }

}