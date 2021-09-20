import * as PIXI from "pixi.js"
const Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite;
const TextureCache = PIXI.utils.TextureCache;

let dungeon, explorer, treasure, map1, blob=[], door ;
let buttonAgain, buttonNext , button_down, textAgain , a1,g,a2,i,n1 , textNext, n2,e,x,t ;
let outerBar ,innerBar, healthBar;
let state;
let buttonUpTexture ;
let buttonDownTexture;

let map2 , leftTopMap ,leftEdgeMap = []  , leftBottomMap=[], 
bottomEdgeMap= [], rightBottomMap=[], rightEdgeMap=[], 
rightTopMap, topEdgeMap= [],centerMap =[], 
wall, wallEdge, water, waterfall, bridge, door2,
tree, stairs;
let walls = [];
let itemsMapWidth;

let btn,message;

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


let gameScene1;
let gameScene2;
let gameOverScene;


loader.onProgress.add(loadProgressHandler)
loader
  .add("./img/treasureHunter.json")
  .add("./img/buttonGame.json")
  .add("./img/map2/map2.json")
  .load(setup);
function loadProgressHandler() {
    console.log("loading"); 
  }
function setup() {
    map1 = resources["./img/treasureHunter.json"].textures; 
    btn =  resources["./img/buttonGame.json"].textures
    map2 = resources["./img/map2/map2.json"].textures; 
    
    
    gameScene1 = new PIXI.Container();
    app.stage.addChild(gameScene1);
    // gameScene1.visible = false;

    if(gameScene1.visible == true){
      const dungeonTexture = TextureCache["dungeon.png"];
    dungeon = new Sprite(dungeonTexture);
    gameScene1.addChild(dungeon);

    explorer = new Sprite(map1["explorer.png"]);
    explorer.x = 35;
    explorer.y = 32;
    explorer.vx =0 ;
    explorer.vy=0;
    gameScene1.addChild(explorer);

    door = new Sprite(map1["door.png"]); 
    door.position.set(32, 0);
    gameScene1.addChild(door);

    treasure = new Sprite(map1["treasure.png"]);
    gameScene1.addChild(treasure);
    treasure.x = gameScene1.width - treasure.width - 48;
    treasure.y = gameScene1.height / 2 - treasure.height / 2;
    gameScene1.addChild(treasure);

    const numberOfBlobs = 6,
            spacing = 48,
            xOffset = 150;
    for (let i = 0; i < numberOfBlobs; i++) {

        //Make a blob
        blob[i] = new Sprite(map1["blob.png"]);

        //Space each blob horizontally according to the `spacing` value.
        //`xOffset` determines the point from the left of the screen
        //at which the first blob should be added.
        const x = spacing * i + xOffset;

        //Give the blob a random y position
        //(`randomInt` is a custom function - see below)
        const y = randomInt(0,  gameScene1.height - blob[i].height  -10);

        //Set the blob's position
        blob[i].x = x;
        blob[i].y = y;
        blob[i].vy=1;

        //Add the blob sprite to the stage
        gameScene1.addChild(blob[i]);
       
    }
    healthBar = new PIXI.Container();
    healthBar.position.set(gameScene1.width - 170, 4);
    gameScene1.addChild(healthBar);

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

    }

    gameScene2 = new PIXI.Container();
    app.stage.addChild(gameScene2);
    gameScene2.visible = false;

    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    textAgain = new PIXI.Container();
    textNext = new PIXI.Container();
    

   
    // game over scene ////////////////
    buttonUpTexture = TextureCache["button_up.png"];
    buttonDownTexture = TextureCache["button_down.png"];
    buttonAgain = new Sprite(buttonUpTexture);
    buttonAgain.x = app.stage.width/3 - 128/2;
    buttonAgain.y = app.stage.height / 2 + 40;
  
    buttonAgain.interactive = true;
    buttonAgain.buttonMode = true;
    buttonAgain
    // Mouse & touch events are normalized into
    // the pointer* events for handling different
    // button events.
        .on('pointerdown', onButtonDownAgain)
        .on('pointerup', onButtonUp)
        .on('pointerupoutside', onButtonUp)
        .on('pointerover', onButtonOver)
        .on('pointerout', onButtonOut);
    buttonNext = new Sprite(buttonUpTexture);
    buttonNext.x = app.stage.width*2/3 - 128/2;
    buttonNext.y = app.stage.height / 2 + 40;
  
    buttonNext.interactive = true;
    buttonNext.buttonMode = true;
    buttonNext
    // Mouse & touch events are normalized into
    // the pointer* events for handling different
    // button events.
        .on('pointerdown', onButtonDownNext)
        .on('pointerup', onButtonUp)
        .on('pointerupoutside', onButtonUp)
        .on('pointerover', onButtonOver)
        .on('pointerout', onButtonOut);

    gameOverScene.addChild(buttonAgain);
    gameOverScene.addChild(buttonNext);

    ////text again ///////////////////
    const space = 3
    a1 = new Sprite(btn["a.png"])
    a1.x= app.stage.width/3 - 128/2 + 128/4  ;
    a1.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(a1)

    g = new Sprite(btn["g.png"])
    g.x= a1.x + a1.width+  space;
    g.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(g)

    a2 = new Sprite(btn["a.png"])
    a2.x= g.x + g.width +  space;
    a2.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(a2)

    i = new Sprite(btn["i.png"])
    i.x= a2.x + a2.width+  space ;
    i.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(i)

    n1 = new Sprite(btn["n.png"])
    n1.x= i.x + i.width+  space ;
    n1.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(n1)

    gameOverScene.addChild(textAgain);
    
    ///////////text next //////////////////
    
    n2 = new Sprite(btn["n.png"])
    n2.x= app.stage.width *2/3 - 128/2 + 128/4+space ;
    n2.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(n2)

    e = new Sprite(btn["e.png"])
    e.x= n2.x + n2.width+  space;
    e.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(e)

    x = new Sprite(btn["x.png"])
    x.x= e.x + e.width +  space;
    x.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(x)

    t = new Sprite(btn["t.png"])
    t.x= x.x + x.width+  space ;
    t.y= app.stage.height / 2 + 42 + 12/2 ; 
    textAgain.addChild(t)

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

    ////////////////Map 2 ////////////////////
    if (gameScene2.visible == true) {
      leftTopMap = new Sprite(map2["leftTopMap.png"])
    leftTopMap.x= 0;
    leftTopMap.y = 0;
    gameScene2.addChild(leftTopMap);
    
    itemsMapWidth = leftTopMap.width;
    for (let i = 0; i <5; i++) {
      
        
        topEdgeMap[i] = new Sprite(map2["topEdgeMap.png"])
        topEdgeMap[i].x = itemsMapWidth +itemsMapWidth*i;
        topEdgeMap[i].y = 0
        gameScene2.addChild(topEdgeMap[i]);
      
        
    }

    rightTopMap = new Sprite(map2["rightTopMap.png"])
    rightTopMap.x= topEdgeMap[4].x + itemsMapWidth;
    rightTopMap.y = 0;
    gameScene2.addChild(rightTopMap);

    for (let i = 0; i < 2; i++) {
      leftEdgeMap[i] = new Sprite(map2["leftEdgeMap.png"])
      leftEdgeMap[i].x = 0;
      leftEdgeMap[i].y =leftTopMap.width + leftTopMap.width*i;
      gameScene2.addChild(leftEdgeMap[i]);
    }

    for (let i = 0; i <5; i++) {
      for (let j = 0; j < 2; j++) {
        centerMap[i+j] = new Sprite(map2["centerMap.png"])
        centerMap[i+j].x = itemsMapWidth +itemsMapWidth*i;
        centerMap[i+j].y = itemsMapWidth + itemsMapWidth*j;
        gameScene2.addChild(centerMap[i+j]);
      }
    }
    for (let i = 0; i < 2; i++) {
      rightEdgeMap[i] = new Sprite(map2["rightEdgeMap.png"])
      rightEdgeMap[i].x = itemsMapWidth *6;
      rightEdgeMap[i].y =leftTopMap.width + leftTopMap.width*i;
      gameScene2.addChild(rightEdgeMap[i]);
    }
    
    ////// row 4////////////////////
    leftBottomMap[0] = new Sprite(map2["leftBottomMap.png"]);
    leftBottomMap[0].x= itemsMapWidth;
    leftBottomMap[0].y= itemsMapWidth*3;
    gameScene2.addChild(leftBottomMap[0])
    
    rightBottomMap[0] = new Sprite(map2["rightBottomMap.png"]);
    rightBottomMap[0].x= itemsMapWidth*2;
    rightBottomMap[0].y= itemsMapWidth*3;
    gameScene2.addChild(rightBottomMap[0])

    leftBottomMap[1] = new Sprite(map2["leftBottomMap.png"]);
    leftBottomMap[1].x= itemsMapWidth*4;
    leftBottomMap[1].y= itemsMapWidth*3;
    gameScene2.addChild(leftBottomMap[1])
    
    rightBottomMap[1] = new Sprite(map2["rightBottomMap.png"]);
    rightBottomMap[1].x= itemsMapWidth*6;
    rightBottomMap[1].y= itemsMapWidth*3;
    gameScene2.addChild(rightBottomMap[1])

    centerMap[0]= new Sprite(map2["centerMap.png"]);
    centerMap[0].x=itemsMapWidth*5;
    centerMap[0].y= itemsMapWidth*3;
    gameScene2.addChild(centerMap[0])

    door2 = new Sprite(map2["door2.png"]);
    door2.x = 0;
    door2.y = itemsMapWidth*3;
    gameScene2.addChild(door2)

    stairs = new Sprite(map2["stairs.png"]);
    stairs.x = itemsMapWidth*3;
    stairs.y = itemsMapWidth*3;
    gameScene2.addChild(stairs)
    ///// row 5////////
    centerMap[0]= new Sprite(map2["centerMap.png"]);
    centerMap[0].x=0;
    centerMap[0].y= itemsMapWidth*4;
    gameScene2.addChild(centerMap[0])

    for (let i = 0; i < 2; i++) {
      wall = new Sprite(map2["wall.png"]);
      wall.x = itemsMapWidth +itemsMapWidth*i;
      wall.y = itemsMapWidth*4;
      walls.push(wall);
      gameScene2.addChild(wall)

    }
    for (let i = 0; i < 3; i++) {
      wall = new Sprite(map2["wall.png"]);
      wall.x = itemsMapWidth*4 +itemsMapWidth*i;
      wall.y = itemsMapWidth*4;
      walls.push(wall);
      gameScene2.addChild(wall)
    }
    console.log(walls)
    explorer = new Sprite(map1["explorer.png"]);
    explorer.x = 35;
    explorer.y = 32;
    explorer.vx =0 ;
    explorer.vy=0;
    gameScene2.addChild(explorer);
    }

    state = play;
    app.ticker.add((delta) => gameLoop(delta));
}
function gameLoop(delta) {

    //Move the cat 1 pixel 
    state(delta);
    
}
function play(delta) {
    if(gameScene1.visible == true){
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
      explorer.x += explorer.vx * delta;
        explorer.y += explorer.vy *delta;
      control();
    }else{
      let check = false
    walls.forEach(function(wall) {
        if(explorer.x +explorer.width > wall.x && explorer.x  < wall.x +itemsMapWidth && explorer.y + explorer.height> wall.y && explorer.y < wall.y + itemsMapWidth){
          check = true
          // if (explorer.y < wall.y + itemsMapWidth && explorer.x > wall.x && explorer.x +explorer.width < wall.y+ wall.height) {
          //   explorer.vy =0;
          //   explorer.vx =0;
          //   explorer.y -=1;
          // }else
          // if (explorer.y > wall.y && explorer.x > wall.x && explorer.x +explorer.width < wall.y+ wall.height) {
          //   explorer.vy =0;
          //   explorer.vx =0;
          //   explorer.y +=2;
          //   console.log("cham duoi")
          // }
          // if (explorer.x  < wall.x +itemsMapWidth && explorer.y > wall.y && explorer.y + explorer.height < wall.y +itemsMapWidth) {
          //   explorer.vx =0;
          //   explorer.vy =0;
          //   explorer.x +=1;
          //   console.log("cham phai")
          // }else
          // if (explorer.x +explorer.width > wall.x  && explorer.y > wall.y && explorer.y + explorer.height < wall.y +itemsMapWidth) {
          //   explorer.vx =0;
          //   explorer.vy =0;
          //   explorer.x -=1;
          //   console.log("cham trái")
          // }
          // if (explorer.y > wall.y && explorer.x > wall.x && explorer.x +explorer.width < wall.y+ wall.height) {
          //   explorer.x-=1;
          //   explorer.y -=1;
          // }
        }

    });
      let explCheck = contain(explorer, {x: 0, y: 0, width:480 , height: 480})
      if (explCheck ==="top" || explCheck ==="bottom") {
        explorer.y += 0;
      }else if (explCheck === "left" || explCheck ==="right") {
        explorer.x += 0;
      }
      if(check){
        explorer.x -=1;
        explorer.y -=1;
        check= false
        
      }else{
        explorer.x += explorer.vx * delta;
        explorer.y += explorer.vy *delta;
        
      }
      console.log(check)
    
      // explorer.vx=1;
      // explorer.vy=1;
      control();
      // check= false
    }
}

function end() {
  gameScene1.visible = false;
  gameScene2.visible = false;
  gameOverScene.visible = true;
}
function againGame() {
  gameScene1.visible = true;
  gameOverScene.visible = false;
  explorer.x = 35;
  explorer.y = 32;
  healthBar.outer.width = 128
  treasure.x = gameScene1.width - treasure.width - 48;
  treasure.y = gameScene1.height / 2 - treasure.height / 2;
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
      explorer.vx = -2;
      if (down.isDown) {
          explorer.vy = 2;
      } else if (up.isDown) {
          explorer.vy = -2;
      }
    };

    left.release = () => {
        if (!right.isDown) {
            explorer.vx = 0;
        }
        if (down.isUp && up.isUp) {
            explorer.vy = 0;
        }
    };
    

    //Up
    up.press = () => {
      explorer.vy = -2;
        if (left.isDown ) {
          explorer.vx = -2;
         
        }else if (right.isDown){
  
          explorer.vx = 2;
        }
    };
    up.release = () => {
      if (!down.isDown) {
          explorer.vy = 0;
      }
      if (left.isUp && right.isUp) {
          explorer.vx = 0;
      }
    };
    

    //Right
    right.press = () => {
      explorer.vx = 2;
      if (down.isDown) {
          explorer.vy = 2;
      } else if (up.isDown) {
          explorer.vy = -2;
      }
    };
    right.release = () => {
        if (!left.isDown) {
            explorer.vx = 0;
        }
        if (down.isUp && up.isUp) {
            explorer.vy = 0;
        }
    };

    //Down
    down.press = () => {
      explorer.vy = 2;
      if (left.isDown) {
          explorer.vx = -2;
      } else if (right.isDown) {
          explorer.vx = 2;
      }
    };
    down.release = () => {
        if (!up.isDown) {
            explorer.vy = 0;
        }
        if (left.isUp && right.isUp) {
            explorer.vx = 0;
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
    // sprite.x = container.width - sprite.width;
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
function onButtonDownAgain() {
  this.isdown = true;
  this.texture = buttonDownTexture;
  this.alpha = 1;
  againGame();
  state = play;
}
function onButtonDownNext() {
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
