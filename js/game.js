var GRID_Y_MAX = 10;
var GRID_X_MAX = 14;
var TILE_SIZE = 64;
var TOOTH_FRAMES = 4;
var TOP_TOOTH_Y = getGridPixel(4);
var BOTTOM_TOOTH_Y = getGridPixel(6);
var FLIPPED=-1,STANDARD=1;

var game = new Phaser.Game(896, 640, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var happyTeeth, sadTeeth, hurtTeeth, downGums, upGums;
var mouse;
function preload() {
  game.load.spritesheet('happyTooth', 'assets/happyTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('sadTooth', 'assets/sadTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('hurtTooth', 'assets/hurtTooth.png', TILE_SIZE, TILE_SIZE);
  game.load.spritesheet('toothbrush', 'assets/toothBrush.png', TILE_SIZE, TILE_SIZE);
  game.load.image('gums', 'assets/gums.png');
  game.load.image('bg', 'assets/background.png');
}

var toothbrush;
function create() {
  mouse = new Phaser.Pointer(game, 0, Phaser.CURSOR);
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.sprite(0, 0, 'bg');

  initGroups(game);
  happyTeeth.enableBody = true;
  generateTopTeeth();
  generateBottomTeeth();

  //toothbrush is on the top of it all, so it shoudl be last.
  toothbrush = game.add.sprite(0, 0, 'toothbrush');
  toothbrush.animations.add('brush', [0,1,2,3,4], 10, true);
  game.physics.enable(toothbrush, Phaser.Physics.ARCADE);

}

var frame = 0;
function update() {
  animateTeeth();
  updateToothbrushPosition();
  cleanTooth();
}

function initGroups(game){
  upGums = game.add.group();
  downGums = game.add.group();
  happyTeeth = game.add.group();
  sadTeeth = game.add.group();
  hurtTeeth = game.add.group();
}

function generateTopTeeth(){
  generateToothRow(FLIPPED, TOP_TOOTH_Y)
}

function generateBottomTeeth(){
  generateToothRow(STANDARD, BOTTOM_TOOTH_Y);
}

function generateToothRow(scale, y){
  for(var i=0; i < 10; i++){
    var gum = downGums.create(getGridPixel(2+i), y, 'gums');
    gum.scale.y = scale;
    var tooth = happyTeeth.create(getGridPixel(2 + i), y, 'happyTooth');
    tooth.tooth = toothFactory();
    tooth.scale.y = scale;
    tooth.animations.add('dance', [0,1,2,3], 2, true);
    tooth = sadTeeth.create(getGridPixel(2 + i), y, 'sadTooth');
    tooth.scale.y = scale;
    tooth.visible = false;
    tooth = hurtTeeth.create(getGridPixel(2 + i), y, 'hurtTooth');
    tooth.scale.y = scale;
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

function updateToothbrushPosition(){
  toothbrush.position.x = game.input.x - (TILE_SIZE / 2);
  toothbrush.position.y = game.input.y - (TILE_SIZE / 2);
}

function cleanTooth(){
  //get the bounding box of the toothbrush sprite, and shrink it to fit the
  //  area of the actual sprite
  var brushArea = toothbrush.getBounds();
  brushArea.y = brushArea.y + 22;
  brushArea.height = 20;
  brushArea.x = brushArea.x + 22;
  brushArea.width = 20;

  //loop through the teeth, are we on top of them?
  happyTeeth.cursorIndex = 0;
  if (game.input.mousePointer.isDown){
    var inTooth = false;
    for (var i = 0; i<happyTeeth.length; i++){
      if (Phaser.Rectangle.intersects(brushArea, happyTeeth.cursor.getBounds())) {
        inTooth = true;
        happyTeeth.cursor.tooth.brush()
        break; //stop if we found one since it's only 1 pointer.
      }
      happyTeeth.next();
    }
    if(inTooth){
      toothbrush.animations.play('brush');
    } else {
      toothbrush.animations.stop();
      toothbrush.frame = 0;
    }
  } else {
    toothbrush.animations.stop();
    toothbrush.frame = 0;
  }
}
