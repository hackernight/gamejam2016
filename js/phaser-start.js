//The game.
var game = new Phaser.Game(896, 640, Phaser.AUTO, 'game');
game.state.add('loading', BrushieBrushie.AssetLoader);
game.state.add('main', BrushieBrushie.Main);
game.state.start('loading');
