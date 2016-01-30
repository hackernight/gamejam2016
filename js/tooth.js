var CLEAN=0, DIRTY=1, DIRTIER=2, DIRTIEST=3;
var BRUSHES_PER_STAGE = 5;
var ID = 0;
function toothFactory(){
  var tooth = {};
  //tooth.state = DIRTIEST;

  //initializes a random state between clean and dirtiest
  tooth.state = Math.floor(Math.random() * 2);
  //TODO: remove this!
  //tooth.state = 0;
  tooth.id = ID++;
  tooth.brushes = 0;
  tooth.brush = function(){
    tooth.brushes += 1;
    if (this.brushes > BRUSHES_PER_STAGE){
      this.brushes = 0;
      this.state = cleanTransistion(this.state);
    }
  };
  tooth.decay = function(){
    this.state = dirtyTransition(this.state);
    this.brushes = 0;
  };

  return tooth;
}

function cleanTransistion(state){
  if (state == CLEAN){
    return CLEAN;
  }
  return state - 1;
}

function dirtyTransition(state){
  if (state == DIRTIEST) {
    return DIRTIEST;
  }
  return state + 1;
}
