var GRID_Y_MAX = 10;
var GRID_X_MAX = 14;
var TILE_SIZE = 64;
var TOOTH_FRAMES = 4;
var TOP_TOOTH_Y = getGridPixel(2);

var game = new Phaser.Game(896, 640, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var happyTeeth;
var sadTeeth;
var hurtTeeth;
function preload() {
  game.load.spritesheet('happyTooth', 'assets/happyTooth.png', 64, 64);
  game.load.spritesheet('sadTooth', 'assets/sadTooth.png', 64, 64);
  game.load.spritesheet('hurtTooth', 'assets/hurtTooth.png', 64, 64);
  game.load.image('bg', 'assets/background.png');
}

function create() {
  game.add.sprite(0, 0, 'bg');

  happyTeeth = game.add.group();
  sadTeeth = game.add.group();
  hurtTeeth = game.add.group();

  // game.add.sprite(getGridPixel(1), getGridPixel(1), 'happyTooth');
  // game.add.sprite(getGridPixel(2), getGridPixel(1), 'sadTooth');
  // game.add.sprite(getGridPixel(3), getGridPixel(1), 'hurtTooth');

  for(var i=0; i < 12; i++){
    happyTeeth.create(getGridPixel(1 + i), TOP_TOOTH_Y, 'happyTooth');
    sadTeeth.create(getGridPixel(1 + i), TOP_TOOTH_Y, 'sadTooth');
    sadTeeth.visible = false;
    hurtTeeth.create(getGridPixel(1 + i), TOP_TOOTH_Y, 'hurtTooth');
    hurtTeeth.visible = false;
  }

}

var frame = 0;
function update() {
  animateTeeth();
  frame += 1;
  if(frame % 10 === 0) {
    for (var i=0;i<12; i++){
      console.log(sadTeeth.cursor)
      var tooth = sadTeeth.cursor.visible = !sadTeeth.cursor.visible;
      sadTeeth.next();
    }
  }
}

function getGridPixel( gridNumber) {
  return ( gridNumber * TILE_SIZE );
}

function animateTeeth(){

}
