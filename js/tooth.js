var CLEAN=0, DIRTY=1, DIRTIER=2, DIRTIEST=3, CAVITY=4;
var BRUSHES_PER_STAGE = 50;
var BRUSHES_PER_STAGE_DEBUG = 5;
var ID = 0;
function toothFactory(){
  var tooth = {};
  //tooth.state = DIRTIEST;

  //initializes a random state between clean and dirtiest
  tooth.state = Math.floor(Math.random() * 2);
  tooth.refresh = true;
  tooth.dirtyiestCounter = 0;
  tooth.id = ID++;
  tooth.brushes = 0;
  tooth.brush = function(){
    tooth.brushes += 1;
    if (this.brushes > BRUSHES_PER_STAGE_DEBUG){
      this.brushes = 0;
      var oldState = this.state;
      this.state = cleanTransistion(this.state);
      if (this.state != oldState) {
        this.refresh = true;
      }
    }
  };
  tooth.decay = function(){
    var oldState = this.state;
    this.state = dirtyTransition(this.state);
    if (this.state != oldState) {
      this.refresh = true;
    }
    this.brushes = 0;
  };

  return tooth;
}

function cleanTransistion(state){
  if (state == CLEAN){
    return CLEAN;
  }
  if (state == CAVITY) {
    return CAVITY;
  }
  return state - 1;
}

function dirtyTransition(state){
  if (state == CAVITY) {
    return CAVITY;
  }
  return state + 1;
}
