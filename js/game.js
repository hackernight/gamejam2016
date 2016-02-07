var BrushieBrushie = {
  levels: []
};

var GRID_Y_MAX = 10;
var GRID_X_MAX = 14;
var TILE_SIZE = 64;
var TOOTH_FRAMES = 4;
var TOP_TOOTH_Y = getGridPixel(4);
var BOTTOM_TOOTH_Y = getGridPixel(6);
var FLIPPED=-1,STANDARD=1;
var DECAY_TIME = 35000;
var MAX_TEETH = 10;
var MAX_CAVITIES_DEFAULT = 2;
/*
 *Game Objects:
 */
//Groups
var teeth, gums, gumBlocks;
//Text
var finalText,
    restartText,
    splashText,
    muteText,
    loadingText;

// Stand Alone Sprites
var redOverlay,
    brushingSound,
    toothbrush,
    splash,
    title;

//Audio
var music;

//Level json
var level;

//Global State
var toothTimers = [], toothStartTimers = []; //Timers to keep the teeth decaying
var muteCleanToothSound; // HACK: this is to avoid instant SHINY spam
var redOverlayLock = false;  //Lock to not trigger the tween twice
var splashIsUp = true;
var doOnce = true; //Used for end of game stuff that needs to happen once.
var quietM = false; //Used to 'debounce' the mute button
var textTimer; //Blinking 'Press Start' timer.
var levelList; //List of level jsons to load
var levelIndex = 0; //The current level
var losingSounds = []; //sounds that we play when you lose
var cleanToothSounds = []; //sounds for when teeth become clean
var levelStartSounds = []; //sounds to play when the level begins
var gettingDirtierSounds = []; //sounds to play when we almost have a cavity
var cavitySounds = []; //sounds when we have a cavity
var lost = false;

BrushieBrushie.AssetLoader = function(game) {};

BrushieBrushie.AssetLoader.prototype = {
  preload: function(){
    this.game.load.json('levels', 'assets/levels/levels.json');
  },
  create: function(){
    var levels = this.game.cache.getJSON('levels').levels;
    for(level in levels){
      BrushieBrushie.levels.push(levels[level]);
    }
  },
  update: function(){
    this.state.start('main');
  }
};

BrushieBrushie.Main = function(game){};

BrushieBrushie.Main.prototype = {
  preload: preload,
  create:create,
  update:update
};

function preload() {
  game.load.spritesheet('happyTooth', 'assets/graphics/happyTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('sadTooth', 'assets/graphics/sadTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('sadderTooth', 'assets/graphics/sadderTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('saddestTooth', 'assets/graphics/saddestTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('cavityTooth', 'assets/graphics/cavityTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('toothbrush', 'assets/graphics/toothBrush.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('splash', 'assets/graphics/splashScreen.png', 896, 640);
  game.load.spritesheet('title', 'assets/graphics/title.png', 896, 640);
  game.load.image('gums', 'assets/graphics/gums.png');
  game.load.image('gumBlock', 'assets/graphics/gumTile.png');
  game.load.image('topLip', 'assets/graphics/topLips.png');
  game.load.image('bottomLip', 'assets/graphics/bottomLips.png');
  game.load.image('bg', 'assets/graphics/background.png');
  game.load.image('realBg', 'assets/graphics/realBackground.png');
  game.load.image('redOverlay', 'assets/graphics/redOverlay.png');

  loadSounds();
  loadLevels();
}

function create() {
  game.add.sprite(0, 0, 'realBg');
  game.add.sprite(0, 0, 'bg');
  brushingSound = game.add.audio('brushingSound', .2, false);
  brushingSound.loop = true;
  brushingSound.play();
  brushingSound.pause();

  music = game.add.audio('bgMusic');
  game.sound.play('bgMusic', 1, true);

  initGroups(game);

  game.add.sprite(0, 0, 'topLip');
  game.add.sprite(0, getGridPixel(5), 'bottomLip');

  showSplashScreen();

  redOverlay = game.add.sprite(0, 0, 'redOverlay');
  redOverlay.alpha = 0;
}

function update() {
  checkForMute();
  if(!splashIsUp){
    animateTeeth();
    updateToothbrushPosition();
    cleanTooth();
    checkForWin();
    if(game.input.keyboard.isDown(Phaser.Keyboard.ESC)){
      resetGame(true);
    }
  } else {
    splash.animations.play('run');
    title.animations.play('bounce');
    checkForGameStart();
  }
}

function checkForMute(){
  if(game.input.keyboard.isDown(Phaser.Keyboard.M) && !quietM){
    quietM = true;
    setTimeout(function(){
      quietM = false;
    }, 200);
    game.sound.mute = !game.sound.mute;
  }
}

function loadLevels(){
  levelList = BrushieBrushie.levels;
  for(var level in levelList){
    game.load.json(levelList[level], 'assets/levels/'+levelList[level]);
  }
}

function loadSounds() {
  game.load.audio('brushingSound', 'assets/sounds/brushSound.ogg');
  game.load.audio('levelStartSound', 'assets/sounds/startLevel.ogg');
  game.load.audio('levelStartSound2', 'assets/sounds/twiceADay.ogg');
  game.load.audio('levelStartSound3', 'assets/sounds/iKnowYouDontWantToButItsGoodForYou.ogg');
  game.load.audio('levelStartSound4', 'assets/sounds/whatALovelySmile.ogg');
  game.load.audio('cleanToothSound', 'assets/sounds/cleanTooth.ogg');
  game.load.audio('yippee', 'assets/sounds/yipee2.ogg');
  game.load.audio('waHoo', 'assets/sounds/waHoo2.ogg');
  game.load.audio('bgMusic', 'assets/sounds/ukeleleTake2.ogg');
  game.load.audio('winGameSound', 'assets/sounds/yayyy.ogg');
  game.load.audio('loseGameSound', 'assets/sounds/denturesItIs.ogg');
  game.load.audio('loseGameSound2', 'assets/sounds/iCantHelpYou2.ogg');
  game.load.audio('loseGameSound3', 'assets/sounds/lookOnTheBrightSide.ogg');
  game.load.audio('gettingDirtier', 'assets/sounds/gettingDirtier.ogg');
  game.load.audio('gettingDirtier2', 'assets/sounds/helpMe2.ogg');
  game.load.audio('gettingDirtier3', 'assets/sounds/ohGross3.ogg');
  game.load.audio('ouchie', 'assets/sounds/ouchie.ogg');
  game.load.audio('ouchie2', 'assets/sounds/noooo.ogg');

  losingSounds = ['loseGameSound', 'loseGameSound2', 'loseGameSound3'];
  cleanToothSounds = ['cleanToothSound', 'yippee', 'waHoo'];
  levelStartSounds = ['levelStartSound', 'levelStartSound2', 'levelStartSound3', 'levelStartSound4'];
  gettingDirtierSounds = ['gettingDirtier', 'gettingDirtier2', 'gettingDirtier3'];
  cavitySounds = ['ouchie', 'ouchie2'];
}

function getRandomSound(soundArray) {
  var arrayIndex = Math.floor(Math.random() * soundArray.length);
  return soundArray[arrayIndex];
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

  muteText = game.add.text(0,0, 'press \'M\' at any time to mute', {fontSize:'15px', fill:'#888', boundsAlignV:'middle', boundsAlignH:'right'});
  muteText.setTextBounds(0, 600, 896, 40);
}

function showToothBrush(){
  //toothbrush is on the top of it all, so it should be last.
  toothbrush = game.add.sprite(0, 0, 'toothbrush');
  toothbrush.animations.add('brush', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
}

function showFinalText(){

  finalText = game.add.text(0, 0, '', { fontSize: '50px', fill: '#FFF', stroke: '#000', strokeThickness: 6 , boundsAlignV: 'middle', boundsAlignH: 'center'})
  finalText.setTextBounds(0, 250 , 896, 100);

  restartText = game.add.text(0, 0, '', { fontSize: '30px', fill: '#FFF', stroke: '#000', strokeThickness: 6 , boundsAlignV: 'middle', boundsAlignH: 'center'})
  restartText.setTextBounds(0, 350 , 896, 100);
  restartText.visible = false;
}

function checkForGameStart(){
  if(game.input.mousePointer.isDown){
    startLevel();
    splashIsUp = false;
    clearInterval(textTimer);
    splashText.destroy();
    splash.destroy();
    title.destroy();
  }
}

function startLevel(){
  level = game.cache.getJSON(levelList[levelIndex++]);
  muteCleanToothSound = true;
  var brushesPerStage = level.brushesPerStage ? level.brushesPerStage : BRUSHES_PER_STAGE_DEFAULT;
  generateTopTeeth(level.top, brushesPerStage);
  generateBottomTeeth(level.bottom, brushesPerStage);
  game.sound.play(getRandomSound(levelStartSounds));
  animateTeeth();
  muteCleanToothSound = false;
  showToothBrush();
  var levelText = game.add.text(0,0, level.name ,{fontSize:'30px', fill:'#FFF', stroke: '#000', strokeThickness:6, boundsAlignV:'middle', boundsAlignH:'center'});
  levelText.setTextBounds(0, 225, 896, 100);
  setTimeout(function(){
    levelText.destroy();
  }, 1000);
}

function initGroups(game){
  gumBlocks = game.add.group();
  gums = game.add.group();
  teeth = game.add.group();
}

function generateTopTeeth(pattern, brushesPerStage){
  generateToothRow(FLIPPED, TOP_TOOTH_Y, pattern, brushesPerStage)
}

function generateBottomTeeth(pattern, brushesPerStage){
  generateToothRow(STANDARD, BOTTOM_TOOTH_Y, pattern, brushesPerStage);
}

function generateToothRow(scale, y, pattern, brushesPerStage){
  for(var i=0; i < MAX_TEETH; i++){
    if(scale == FLIPPED){
      var gumBlock = gumBlocks.create(getGridPixel(2+i), y - 128 , 'gumBlock');
    } else {
      var gumBlock = gumBlocks.create(getGridPixel(2+i), y + 64, 'gumBlock');
    }
    var gum = gums.create(getGridPixel(2+i), y, 'gums');
    gum.scale.y = scale;
    if(pattern[i] == '1'){ //only put the tooth we actually want
      var sprite = teeth.create(getGridPixel(2 + i), y, 'happyTooth');
      sprite.animations.add('dance', [0,1,2,3], 10, true);
      var theTooth = toothFactory(brushesPerStage);
      sprite.tooth = theTooth;
      var timerStart = Math.random() * level.decayTime;
      toothStartTimers.push(setTimeout(function(theTooth){
        theTooth.decay();
        toothTimers.push(
          setInterval(
            function(tooth){
              tooth.decay()
            },
             level.decayTime,
             theTooth)
        );
      }, timerStart, sprite.tooth));
      sprite.scale.y = scale;
    }
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
            game.sound.play(getRandomSound(cleanToothSounds));
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
          game.sound.play(getRandomSound(gettingDirtierSounds));

          break;
      default :
          sprite.loadTexture('cavityTooth',0);
          game.sound.play(getRandomSound(cavitySounds));

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
  var allowedCavities = level.maxCavities ? level.maxCavities : MAX_CAVITIES_DEFAULT;
  if (cavityCount >= allowedCavities ){
    if(doOnce){
      doOnce = false;

      showFinalText();
      finalText.text = "Take better care of your teeth!";
      restartText.text = "Space to restart!";
      restartText.visible = true;
      lost = true;
      //game.sound.pause('bgMusic');
      //game.sound.play('loseGameSound');
      game.sound.play(getRandomSound(losingSounds));
    }
  } else if(totalHealthy + cavityCount == teeth.length){
    if(doOnce){
      doOnce = false;

      showFinalText();
      var endText = level.nextLevel == 'end' ? 'You\'ve cleaned all the teeth!' : 'All Clean';
      finalText.text = endText;
      var instructions = level.nextLevel == 'end' ? 'Space to restart!': 'Press space to go to the next level.';
      restartText.text = instructions;
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
  if(game.input.keyboard.isDown(Phaser.Keyboard.ESC)){
    resetGame(true);
    return;
  }
  if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.keyboard.isDown(Phaser.Keyboard.ESC)){
    if(!lost && level.nextLevel != 'end'){
      resetGame(false);
      return;
    } else {
      lost = false;
      resetGame(true);
      return;
    }
  }
}

function resetGame(showSplash){
  console.log('Level index! ', levelIndex);
  teeth.destroy(true, false);
  teeth = game.add.group()
  toothbrush.destroy();
  if(showSplash){
    showSplashScreen();
    levelIndex = 0;
    console.log('reset level index: ', levelIndex);
  } else {
    splashIsUp = false;
    startLevel();
  }
  if(finalText !== undefined){
    finalText.destroy();
  }
  if (restartText !== undefined){
    restartText.destroy();
  }
  doOnce = true;
}

//The game.
var game = new Phaser.Game(896, 640, Phaser.AUTO, 'game');
game.state.add('loading', BrushieBrushie.AssetLoader);
game.state.add('main', BrushieBrushie.Main);
game.state.start('loading');
