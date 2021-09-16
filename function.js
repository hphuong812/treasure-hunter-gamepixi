const Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite;
const TextureCache = PIXI.utils.TextureCache;

let dungeon, explorer, treasure, id, blob=[], door ;
let button , button_down, textAgain , a1,g,a2,i,n ;
let outerBar ,innerBar, healthBar;
let state;
let buttonUpTexture ;
let buttonDownTexture;

let type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
      type = "canvas";
    }

const app = new Application({ 
    width: 256,         // default: 800
    height: 256,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
  }
);
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0x061639;
app.renderer.autoDensity = true;
app.renderer.resize(512, 512);


let gameScene;

let gameOverScene;


loader.onProgress.add(loadProgressHandler)
loader
  .add("./img/treasureHunter.json")
  .add("./img/buttonAgain.json")
  .load(setup);
function loadProgressHandler() {
    console.log("loading"); 
  }
function setup() {
    id = resources["./img/treasureHunter.json"].textures; 
    btn =  resources["./img/buttonAgain.json"].textures
    
    
    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    textAgain = new PIXI.Container();
    

    const dungeonTexture = TextureCache["dungeon.png"];
    dungeon = new Sprite(dungeonTexture);
    gameScene.addChild(dungeon);

    explorer = new Sprite(id["explorer.png"]);
    explorer.x = 35;
    explorer.y = 32;
    explorer.vx =0 ;
    explorer.vy=0;
    gameScene.addChild(explorer);

    door = new Sprite(id["door.png"]); 
    door.position.set(32, 0);
    gameScene.addChild(door);

    treasure = new Sprite(id["treasure.png"]);
    gameScene.addChild(treasure);
    treasure.x = gameScene.width - treasure.width - 48;
    treasure.y = gameScene.height / 2 - treasure.height / 2;
    gameScene.addChild(treasure);

    const numberOfBlobs = 6,
            spacing = 48,
            xOffset = 150;
    for (let i = 0; i < numberOfBlobs; i++) {

        //Make a blob
        blob[i] = new Sprite(id["blob.png"]);

        //Space each blob horizontally according to the `spacing` value.
        //`xOffset` determines the point from the left of the screen
        //at which the first blob should be added.
        const x = spacing * i + xOffset;

        //Give the blob a random y position
        //(`randomInt` is a custom function - see below)
        const y = randomInt(0,  gameScene.height - blob[i].height  -10);

        //Set the blob's position
        blob[i].x = x;
        blob[i].y = y;
        blob[i].vy=1;

        //Add the blob sprite to the stage
        gameScene.addChild(blob[i]);
       
    }
    healthBar = new PIXI.Container();
    healthBar.position.set(gameScene.width - 170, 4);
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    // game over scene ////////////////
    buttonUpTexture = TextureCache["button_up.png"];
    buttonDownTexture = TextureCache["button_down.png"];
    button = new Sprite(buttonUpTexture);
    button.x = app.stage.width/2 -128/2;
    button.y = app.stage.height / 2 + 40;
  
    button.interactive = true;
    button.buttonMode = true;
    button
    // Mouse & touch events are normalized into
    // the pointer* events for handling different
    // button events.
        .on('pointerdown', onButtonDown)
        .on('pointerup', onButtonUp)
        .on('pointerupoutside', onButtonUp)
        .on('pointerover', onButtonOver)
        .on('pointerout', onButtonOut);
    gameOverScene.addChild(button);

    const space = 3
    a1 = new Sprite(btn["a.png"])
    a1.x= app.stage.width/2 - 128/2 + 128/4  ;
    a1.y= app.stage.height / 2 + 40 + 12/2 ; 
    textAgain.addChild(a1)

    g = new Sprite(btn["g.png"])
    g.x= a1.x + a1.width+  space;
    g.y= app.stage.height / 2 + 40 + 12/2 ; 
    textAgain.addChild(g)

    a2 = new Sprite(btn["a.png"])
    a2.x= g.x + g.width +  space;
    a2.y= app.stage.height / 2 + 40 + 12/2 ; 
    textAgain.addChild(a2)

    i = new Sprite(btn["i.png"])
    i.x= a2.x + a2.width+  space ;
    i.y= app.stage.height / 2 + 40 + 12/2 ; 
    textAgain.addChild(i)

    n = new Sprite(btn["n.png"])
    n.x= i.x + i.width+  space ;
    n.y= app.stage.height / 2 + 40 + 12/2 ; 
    textAgain.addChild(n)

    gameOverScene.addChild(textAgain);
    

    const style = new PIXI.TextStyle({
      fontFamily: "Futura",
      fontSize: 64,
      fill: "white"
    });
    message = new PIXI.Text("The End!", style);
    message.x = app.stage.width/2 -200/2;
    message.y = app.stage.height / 2 - 32;


    gameOverScene.addChild(message);

    state = play;

    
    
    
    app.ticker.add((delta) => gameLoop(delta));
}
function gameLoop(delta) {

    //Move the cat 1 pixel 
    state(delta);
    
}
function play(delta) {
    control();
    for(let j = 0; j < blob.length; j++) {
      if(detectCollision(explorer, blob[j])){
       
        explorer.alpha = 0.5;
        healthBar.outer.width -= 1;
      }
      else{
        explorer.alpha = 1;
      }
      
      blob[j].y += blob[j].vy
      let blobHitsWall =detectCollisionWall(blob[j]);
      if (blobHitsWall === "top" || blobHitsWall === "bottom") {
          blob[j].vy *= -1;
      }
    }
    
    if (detectCollision(explorer, treasure)) {
      treasure.x = explorer.x + 8;
      treasure.y = explorer.y + 8;
    }
    let explorerHitsWall = detectCollisionWall(explorer);
    if(explorerHitsWall === "top" || explorerHitsWall === "bottom"){
      explorer.y += 0;
    }else if (explorerHitsWall === "left" || explorerHitsWall === "right") {
      explorer.x += 0;
    }else{
      explorer.x += explorer.vx;
     explorer.y += explorer.vy;
    }
    if (hitTestRectangle(treasure, door)) {
      state = end;
      message.text = "You won!";
    }
    if (healthBar.outer.width < 0) {
      state = end;
      message.text = "You lost!";
    }
    
}

function end() {
  gameScene.resolution = 0.5;
  gameOverScene.visible = true;
}
function againGame() {
  // gameScene.visible = true;
  gameOverScene.visible = false;
  explorer.x = 35;
  explorer.y = 32;
  healthBar.outer.width = 128
  treasure.x = gameScene.width - treasure.width - 48;
  treasure.y = gameScene.height / 2 - treasure.height / 2;
}

function detectCollision(obj1, obj2) {
  if(hitTestRectangle(obj1,obj2)){
      return true;
  }else
  {
    return false;
  }    
}
function detectCollisionWall(obj1) {
  return contain(obj1, {x: 28, y: 10, width: 488, height: 480});
}
function control(){
    const left = keyboard("ArrowLeft"),
            up = keyboard("ArrowUp"),
            right = keyboard("ArrowRight"),
            down = keyboard("ArrowDown");
        //Left arrow key `press` method
    left.press = () => {
        //Change the cat's velocity when the key is pressed
        explorer.vx = -1;
        explorer.vy = 0;
    };
    
    //Left arrow key `release` method
    left.release = () => {
        //If the left arrow has been released, and the right arrow isn't down,
        //and the cat isn't moving vertically:
        //Stop the cat
        if (!right.isDown && explorer.vy === 0) {
        explorer.vx = 0;
        }
    };

    //Up
    up.press = () => {
        explorer.vy = -1;
        explorer.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && explorer.vx === 0) {
        explorer.vy = 0;
        }
    };

    //Right
    right.press = () => {
        explorer.vx = 1;
        explorer.vy = 0;
    };
    right.release = () => {
        if (!left.isDown && explorer.vy === 0) {
        explorer.vx = 0;
        }
    };

    //Down
    down.press = () => {
        explorer.vy = 1;
        explorer.vx = 0;
    };
    down.release = () => {
        if (!up.isDown && explorer.vx === 0) {
        explorer.vy = 0;
        }
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = (event) => {
      if (event.key === key.value) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = (event) => {
      if (event.key === key.value) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
  }

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  
    //hit will determine whether there's a collision
    hit = false;
  
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
  
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
  
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
  
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {
  
        //There's definitely a collision happening
        hit = true;
      } else {
  
        //There's no collision on the y axis
        hit = false;
      }
    } else {
  
      //There's no collision on the x axis
      hit = false;
    }
  
    //`hit` will be either `true` or `false`
    return hit;
  };

function contain(sprite, container) {

  let collision = undefined;

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }

  //Return the `collision` value
  return collision;
}
function onButtonDown() {
  this.isdown = true;
  this.texture = buttonDownTexture;
  this.alpha = 1;
  againGame();
  state = play;
}

function onButtonUp() {
  this.isdown = false;
  this.texture = buttonUpTexture;
}

function onButtonOver() {
  this.isOver = true;
  if (this.isdown) {
      return;
  }
  this.texture = buttonDownTexture;
}

function onButtonOut() {
  this.isOver = false;
  if (this.isdown) {
      return;
  }
  this.texture = buttonUpTexture;
}
