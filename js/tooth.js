var CLEAN=0, DIRTY=1, DIRTIER=2, DIRTIEST=3;
var BRUSHES_PER_STAGE = 50;
var ID = 0;
function toothFactory(){
  var tooth = {};
  tooth.state = DIRTIEST;
  console.log('Spawning tooth: ', ID);
  tooth.id = ID++;
  tooth.brushes = 0;
  tooth.brush = function(){
    tooth.brushes += 1;
    if (this.brushes > BRUSHES_PER_STAGE){
      this.brushes = 0;
      this.state = cleanTransistion(this.state);
    }
    console.log('[CLEAN]' + this.id + ' State: ', this.state, ' Brushes: ', this.brushes);
  };
  tooth.decay = function(){
    this.state = dirtyTransition(this.state);
    this.brushes = 0;
    console.log('[DIRTY AFTER ', this.id, '] State: ', this.state, ' Brushes: ', this.brushes);
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
  console.log('HAHA I\'M GETTING DIRTIER!!!', state);
  return state + 1;
}
