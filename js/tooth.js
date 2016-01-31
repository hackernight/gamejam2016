var CLEAN=0, DIRTY=1, DIRTIER=2, DIRTIEST=3;
var BRUSHES_PER_STAGE = 50;
var BRUSHES_PER_STAGE_DEBUG = 5;
var ID = 0;
function toothFactory(){
  var tooth = {};
  //tooth.state = DIRTIEST;

  //initializes a random state between clean and dirtiest
  tooth.state = Math.floor(Math.random() * 2);
  tooth.refresh = true;
  tooth.id = ID++;
  //console.log('Tooth: ' + tooth.id + ' State: ' + tooth.state + ' PrevState: ', tooth.prevState )
  tooth.brushes = 0;
  tooth.brush = function(){
    tooth.brushes += 1;
    if (this.brushes > BRUSHES_PER_STAGE_DEBUG){
      this.brushes = 0;
      this.refresh = true;
      this.state = cleanTransistion(this.state);
    }
  };
  tooth.decay = function(){
    this.refresh = true;
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
