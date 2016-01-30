var CLEAN=0, DIRTY=1, DIRTIER=2, DIRTIEST=3;
var BRUSHES_PER_STAGE = 5;
function toothFactory(){
  var tooth = {};
  tooth.state = DIRTIEST;
  tooth.brushes = 0;
  tooth.brush = function(){
    tooth.brushes += 1;
    if (this.brushes > BRUSHES_PER_STAGE){
      this.brushes = 0;
      this.state = cleanTransistion(this.state);
    }
    console.log('State: ', this.state, ' Brushes: ', this.brushes);
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
