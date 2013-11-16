Preloader = function (game) {

  var _this = this;

  this.preloadBar = null;

  this.ready = false;

  this.preload = function () {


    //this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');
    // this.load.setPreloadSprite(this.preloadBar);

    var images = ['hex', 'hex-glow', 'arrow', 'circlet', 'bonbon', 'sweet', 'diamond', 'arrow', 'sparkle'];

    images.forEach(function (img) {
      _this.load.image(img, 'assets/' + img + '.png');
    });

    game.load.audio('coin', ['assets/coin.mp3']);


    /*    this.load.image('titlepage', 'images/title.jpg');
     this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
     this.load.audio('titleMusic', ['audio/main_menu.mp3']);
     this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');*/

  };

  this.create = function () {

    //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while
    //this.preloadBar.cropEnabled = false;

  };

  this.update = function () {

    //	If you don't have any music in your game then put the game.state.start line into the create function and delete
    //	the update function completely.

    if (this.cache.isSoundDecoded('titleMusic') && this.ready == false) {
      this.ready = false;
      this.game.state.start('MainMenu');
    }

    this.game.state.start('Game');

  };

};
