var GRID_Y_MAX = 10;
var GRID_X_MAX = 14;
var TILE_SIZE = 64;
var TOOTH_FRAMES = 4;
var TOP_TOOTH_Y = getGridPixel(3);
var BOTTOM_TOOTH_Y = getGridPixel(6);

var game = new Phaser.Game(896, 640, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var happyTeeth, sadTeeth, hurtTeeth, downGums, upGums;
function preload() {
  game.load.spritesheet('happyTooth', 'assets/happyTooth.png', 64, 64);
  game.load.spritesheet('sadTooth', 'assets/sadTooth.png', 64, 64);
  game.load.spritesheet('hurtTooth', 'assets/hurtTooth.png', 64, 64);
  game.load.image('gums', 'assets/gums.png');
  game.load.image('bg', 'assets/background.png');
}

function create() {
  game.add.sprite(0, 0, 'bg');

  game.physics.startSystem(Phaser.Physics.ARCADE);

  initGroups(game);
  happyTeeth.enableBody = true;
  generateTopTeeth();
  generateBottomTeeth();
}

var frame = 0;
function update() {
  animateTeeth();
}

function initGroups(game){
  upGums = game.add.group();
  downGums = game.add.group();
  happyTeeth = game.add.group();
  sadTeeth = game.add.group();
  hurtTeeth = game.add.group();
}

function generateTopTeeth(){
  for(var i=0; i < 10; i++){
    var gum = upGums.create(getGridPixel(2+i), TOP_TOOTH_Y, 'gums');
    gum.scale.y = -1;
    var tooth = happyTeeth.create(getGridPixel(2 + i), TOP_TOOTH_Y, 'happyTooth');
    tooth.animations.add('dance', [0,1,2,3], 4, true);
    tooth.scale.y = -1;
    tooth = sadTeeth.create(getGridPixel(2 + i), TOP_TOOTH_Y, 'sadTooth');
    tooth.scale.y = -1;
    tooth.visible = false;
    tooth = hurtTeeth.create(getGridPixel(2 + i), TOP_TOOTH_Y, 'hurtTooth');
    tooth.scale.y = -1;
    tooth.visible = false;
  }
}

function generateBottomTeeth(){
  for(var i=0; i < 10; i++){
    var gum = downGums.create(getGridPixel(2+i), BOTTOM_TOOTH_Y, 'gums');
    var tooth = happyTeeth.create(getGridPixel(2 + i), BOTTOM_TOOTH_Y, 'happyTooth');
    tooth = sadTeeth.create(getGridPixel(2 + i), BOTTOM_TOOTH_Y, 'sadTooth');
    tooth.visible = false;
    tooth = hurtTeeth.create(getGridPixel(2 + i), BOTTOM_TOOTH_Y, 'hurtTooth');
    tooth.visible = false;
  }
}

function getGridPixel( gridNumber) {
  return ( gridNumber * TILE_SIZE );
}

function animateTeeth(){
  happyTeeth.cursorIndex = 0;
  for (var i=0; i<happyTeeth.length; i++){
    happyTeeth.cursor.animations.play('dance');
    happyTeeth.next();
  }
}
