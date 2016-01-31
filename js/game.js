var GRID_Y_MAX = 10;
var GRID_X_MAX = 14;
var TILE_SIZE = 64;
var TOOTH_FRAMES = 4;
var TOP_TOOTH_Y = getGridPixel(4);
var BOTTOM_TOOTH_Y = getGridPixel(6);
var FLIPPED=-1,STANDARD=1;
var DECAY_TIME = 35000;
var MAX_CAVITIES = 2;

var game = new Phaser.Game(896, 640, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var teeth, downGums, gumBlocks;
var mouse;
var toothTimers = [], toothStartTimers = [];
function preload() {
  game.load.spritesheet('happyTooth', 'assets/happyTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('sadTooth', 'assets/sadTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('sadderTooth', 'assets/sadderTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('saddestTooth', 'assets/saddestTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('cavityTooth', 'assets/cavityTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('toothbrush', 'assets/toothBrush.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('splash', 'assets/splashScreen.png', 896, 640);
  game.load.spritesheet('title', 'assets/title.png', 896, 640);
  game.load.image('gums', 'assets/gums.png');
  game.load.image('gumBlock', 'assets/gumTile.png');
  game.load.image('topLip', 'assets/topLips.png');
  game.load.image('bottomLip', 'assets/bottomLips.png');
  game.load.image('bg', 'assets/background.png');
  game.load.image('realBg', 'assets/realBackground.png');
  game.load.image('redOverlay', 'assets/redOverlay.png');

  game.load.audio('brushingSound', 'assets/Sounds/brushSound.ogg');
  game.load.audio('levelStartSound', 'assets/Sounds/startLevel.ogg');
  game.load.audio('cleanToothSound', 'assets/Sounds/cleanTooth.ogg');
  game.load.audio('bgMusic', 'assets/Sounds/ukeleleTake2.ogg');
  game.load.audio('winGameSound', 'assets/Sounds/yayyy.ogg');
  game.load.audio('loseGameSound', 'assets/Sounds/denturesItIs.ogg');
  game.load.audio('gettingDirtier', 'assets/Sounds/gettingDirtier.ogg');
  game.load.audio('ouchie', 'assets/Sounds/ouchie.ogg');
}

var toothbrush, redOverlay;
var finalText;
var restartText;
var brushingSound;
var muteCleanToothSound;
var splashIsUp = true;
var splash, splashText, textTimer, title;
var redOverlayLock = false;
function create() {
  mouse = new Phaser.Pointer(game, 0, Phaser.CURSOR);
  game.add.sprite(0, 0, 'realBg');
  game.add.sprite(0, 0, 'bg');
  brushingSound = game.add.audio('brushingSound');
  brushingSound.loop = true;
  brushingSound.play();
  brushingSound.pause();

  var music = game.add.audio('bgMusic');
  game.sound.play('bgMusic', 1, true);

  initGroups(game);

  game.add.sprite(0, 0, 'topLip');
  game.add.sprite(0, getGridPixel(5), 'bottomLip');

  showSplashScreen();

  redOverlay = game.add.sprite(0, 0, 'redOverlay');
  redOverlay.alpha = 0;

}

var frame = 0;
function update() {
  if(!splashIsUp){
    animateTeeth();
    updateToothbrushPosition();
    cleanTooth();
    checkForWin();
  } else {
    splash.animations.play('run');
    title.animations.play('bounce');
    checkForGameStart();
  }
}

function showSplashScreen(){
  splashIsUp = true;
  splash = game.add.sprite(0,0, 'splash');
  splash.animations.add('run', [0,1,2,3], 6, true);

  title = game.add.sprite(0,0,'title');
  title.animations.add('bounce', [0,1,2,3,4,5], 10, true);

  splashText = game.add.text(0,0, 'Click To Start...', {fontSize:'30px', fill:'#FFF', stroke: '#000', strokeThickness:6, boundsAlignV:'middle', boundsAlignH:'center'});
  splashText.setTextBounds(0, 225, 896, 100);
  textTimer = setInterval(function(){
    splashText.visible = !splashText.visible;
  }, 500);
}

function showToothBrush(){
  //toothbrush is on the top of it all, so it should be last.
  toothbrush = game.add.sprite(0, 0, 'toothbrush');
  toothbrush.animations.add('brush', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
}

function showFinalText(){
  finalText = game.add.text(0, 0, '', { fontSize: '50px', fill: '#FFF', stroke: '#000', strokeThickness: 6 , boundsAlignV: 'middle', boundsAlignH: 'center'})
  finalText.setTextBounds(0, 250 , 896, 100);

  restartText = game.add.text(0, 0, 'Space to restart!', { fontSize: '30px', fill: '#FFF', stroke: '#000', strokeThickness: 6 , boundsAlignV: 'middle', boundsAlignH: 'center'})
  restartText.setTextBounds(0, 350 , 896, 100);
  restartText.visible = false;
}

function checkForGameStart(){
  if(game.input.mousePointer.isDown){
    muteCleanToothSound = true;
    generateTopTeeth();
    generateBottomTeeth();
    game.sound.play('levelStartSound');
    animateTeeth();
    muteCleanToothSound = false;
    showToothBrush();
    splashIsUp = false;
    clearInterval(textTimer);
    splashText.destroy();
    splash.destroy();
    title.destroy();
  }
}

function initGroups(game){
  gumBlocks = game.add.group();
  downGums = game.add.group();
  teeth = game.add.group();
}

function generateTopTeeth(){
  generateToothRow(FLIPPED, TOP_TOOTH_Y)
}

function generateBottomTeeth(){
  generateToothRow(STANDARD, BOTTOM_TOOTH_Y);
}

function generateToothRow(scale, y){
  for(var i=0; i < 10; i++){
    if(scale == FLIPPED){
      var gumBlock = gumBlocks.create(getGridPixel(2+i), y - 128 , 'gumBlock');
    } else {
      var gumBlock = gumBlocks.create(getGridPixel(2+i), y + 64, 'gumBlock');
    }
    var gum = downGums.create(getGridPixel(2+i), y, 'gums');
    gum.scale.y = scale;
    var sprite = teeth.create(getGridPixel(2 + i), y, 'happyTooth');
    sprite.animations.add('dance', [0,1,2,3], 10, true);
    var theTooth = toothFactory();
    sprite.tooth = theTooth;
    var timerStart = Math.random() * DECAY_TIME;
    toothStartTimers.push(setTimeout(function(theTooth){
      theTooth.decay();
      toothTimers.push(
        setInterval(
          function(tooth){
            tooth.decay()
          },
           DECAY_TIME,
           theTooth)
      );
    }, timerStart, sprite.tooth));
    sprite.scale.y = scale;
  }
}

function getGridPixel( gridNumber) {
  return ( gridNumber * TILE_SIZE );
}

function animateTeeth(){
  for (var i=0; i<teeth.length; i++){
    updateToothSprite(teeth.cursor)
    teeth.cursor.play('dance');
    teeth.next();
  }
}

function updateToothSprite(sprite) {
  if(sprite.tooth.refresh){
      sprite.tooth.refresh = false;
      sprite.animations.stop('dance');

    switch (sprite.tooth.state) {
      case CLEAN :
          sprite.loadTexture('happyTooth',0);
          if (!muteCleanToothSound) {
            game.sound.play('cleanToothSound');
          }
          break;
      case DIRTY :
          sprite.loadTexture('sadTooth',0);
          break;
      case DIRTIER :
          sprite.loadTexture('sadderTooth',0);
          break;
      case DIRTIEST :
          sprite.loadTexture('saddestTooth',0);
          game.sound.play('gettingDirtier');

          break;
      default :
          sprite.loadTexture('cavityTooth',0);
          game.sound.play('ouchie');

      }
      sprite.animations.add('dance', [0,1,2,3], 10, true);
  }
}



function updateToothbrushPosition(){
  toothbrush.position.x = game.input.x - (TILE_SIZE / 4);
  toothbrush.position.y = game.input.y - (TILE_SIZE / 4);
}

function cleanTooth(){
  //get the bounding box of the toothbrush sprite, and shrink it to fit the
  //  area of the actual sprite
  var brushArea = toothbrush.getBounds();
  brushArea.y = brushArea.y + 15;
  brushArea.height = 1;
  brushArea.x = brushArea.x + 15;
  brushArea.width = 1;

  //loop through the teeth, are we on top of them?
  if (game.input.mousePointer.isDown){
    var inTooth = false;
    var tween;
    for (var i = 0; i<teeth.length; i++){
      if (Phaser.Rectangle.intersects(brushArea, teeth.cursor.getBounds())) {
        inTooth = true;
        teeth.cursor.tooth.brush()
        if(teeth.cursor.tooth.state == CAVITY && redOverlayLock == false) {
          tween = game.add.tween(redOverlay).to( { alpha: .5 }, 250, Phaser.Easing.Linear.None, true, 0, 0, true);
          redOverlayLock = true;
          tween.onComplete.add(function(){redOverlayLock = false;}, this);
        }
        break; //stop if we found one since it's only 1 pointer.
      }
      teeth.next();
    }
    if(inTooth){
      toothbrush.animations.play('brush');
      brushingSound.resume();
    } else {
      toothbrush.animations.stop();
      toothbrush.frame = 0;
      brushingSound.pause();
    }
  } else {
    toothbrush.animations.stop();
    toothbrush.frame = 0;
    brushingSound.pause();
  }
}

var doOnce = true;
function checkForWin(){
  var cavityCount = 0;
  var totalHealthy = teeth.length;
  for(var i=0; i<teeth.length; i++){
    if (teeth.cursor.tooth.state == CAVITY){
      cavityCount += 1;
    }
    if(teeth.cursor.tooth.state != CLEAN){
      totalHealthy -= 1;
    }
    teeth.next();
  }
  if (cavityCount >= MAX_CAVITIES ){
    if(doOnce){
      doOnce = false;

      showFinalText();
      finalText.text = "Take better care of your teeth!"
      restartText.visible = true;

      //game.sound.pause('bgMusic');
      game.sound.play('loseGameSound');
    }
  } else if(totalHealthy + cavityCount == teeth.length){
    if(doOnce){
      doOnce = false;

      showFinalText();
      finalText.text = 'All Clean!'
      restartText.visible = true;

      //game.sound.pause('bgMusic');
      game.sound.play('winGameSound');
    }
  } else {
    return;
  }
  //clear the ones that haven't been scheulded yet.
  for (var startIndex in toothStartTimers){
    clearTimeout(toothStartTimers[startIndex]);
  }
  toothStartTimers = [];

  for(var timerIndex in toothTimers) {
    clearInterval(toothTimers[timerIndex]);
  }
  toothTimers = [];
  //look for restart
  if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
    resetGame();
  }
}

function resetGame(){
  teeth.destroy(true, false);
  teeth = game.add.group()
  toothbrush.destroy();
  showSplashScreen();
  finalText.destroy();
  restartText.destroy();
  doOnce = true;
}
