Monsta.Game = function (game) {

  var _this = this;

  this.game;		//	a reference to the currently running game
  this.add;		//	used to add sprites, text, groups, etc
  this.camera;	//	a reference to the game camera
  this.cache;		//	the game cache
  this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
  this.load;		//	for preloading assets
  this.math;		//	lots of useful common math operations
  this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
  this.stage;		//	the game stage
  this.time;		//	the clock
  this.tweens;	//	the tween manager
  this.world;		//	the game world
  this.particles;	//	the particle manager
  this.physics;	//	the physics manager
  this.rnd;		//	the repeatable random number generator

  this.background;

  this.bgSprites = [];
  this.sprites = [];
  this.candySprites = [];


  this.create = function () {

    Monsta.Board.build();

    this.backgroundGroup = game.add.group();
    this.unselectables = [];

    this.addBoard();
  };

  this.update = function (pointer) {

  };


  this.tweenThat = function (that, kind) {
    game.add.tween(that).to(kind, 100, Phaser.Easing.Sinusoidal.InOut, true, 0);
  };

  this.tweenThese = function (these, kind) {
    these.forEach(function (that) {
      _this.tweenThat(that, kind);
    });
  };

  this.forEachPiece = function (callback) {
    var r, c;

    for (r = 0; r < Monsta.Board.config.size.rows; r++) {
      for (c = 0; c < Monsta.Board.config.size.cols; c++) {
        callback(c, r);
      }
    }
  };


  this.addBoard = function () {

    this.forEachPiece(function (c, r) {

      if (!_this.bgSprites[r]) _this.bgSprites[r] = [];
      _this.bgSprites[r][c] = _this.addBg(c, r);
      _this.backgroundGroup.add(_this.bgSprites[r][c]);

      if (!_this.candySprites[r]) _this.candySprites[r] = [];
      _this.candySprites[r][c] = _this.addCandy(c, r);
    });

    this.game.input.onUp.add(this.hexUp, this);
    //this.game.input.onOutOfBounds(this.pieceUp, this);
  };

  this.addSprite = function (col, row, kind) {
    var sprite,
      pos = Monsta.Board.calculatePosition(col, row);

    sprite = game.add.sprite(pos.x, pos.y, kind);
    sprite.anchor.setTo(0.5, 0.5);

    this.sprites[sprite] = {
      col: col,
      row: row,
      kind: kind
    };

    return sprite;
  };

  this.addCandy = function (col, row) {

    var kind = Monsta.Board.current[row][col],
      candy = this.addSprite(col, row, kind);

    candy.scale.setTo(Monsta.Board.config.candyScale, Monsta.Board.config.candyScale);

    return candy;
  };

  this.addBg = function (col, row) {

    var hex = this.addSprite(col, row, 'hex');

    hex.scale.setTo(Monsta.Board.config.hexScale, Monsta.Board.config.hexScale);
    hex.inputEnabled = hex.input.pixelPerfect = true;
    hex.hexPos = { col: col, row: row };

    hex.events.onInputDown.add(this.hexDown, this);
    hex.events.onInputOver.add(this.hexOver, this);

    return hex;
  };


  this.hexDown = function (sprite) {
    this.addToSelection(sprite.hexPos);
    this.startSelecting();
  };

  this.hexOver = function (sprite) {

    var firstCandyKind,
      lastSelectedCandy,
      preLastSelectedCandy,
      tryCandy;

    if (Monsta.Board.selection.length == 0) return;

    firstCandyKind = Monsta.Board.posToKind(Monsta.Board.selection[0]);
    tryCandy = Monsta.Board.spriteToKind(sprite);

    if (firstCandyKind != tryCandy) return;

    lastSelectedCandy = Monsta.Board.selection[Monsta.Board.selection.length - 1];
    preLastSelectedCandy = Monsta.Board.selection[Monsta.Board.selection.length - 2];

    if (Monsta.Board.selection.length > 1 &&
      Monsta.Board.areSame(sprite.hexPos, preLastSelectedCandy)) {
      console.log('aresame',Monsta.Board.selection.length, sprite.hexPos, preLastSelectedCandy)
      this.removeFromSelection();
    } else if (Monsta.Board.areAdjacent(lastSelectedCandy, sprite.hexPos)) {
      this.addToSelection(sprite.hexPos);
    }
  };

  this.hexUp = function () {

    this.endSelecting();
    this.clearSelection();
  };

  this.updateUnselectables = function () {
    var firstCandyKind = Monsta.Board.posToKind(Monsta.Board.selection[0]);
    this.forEachPiece(function (c, r) {
      if (Monsta.Board.current[r][c] != firstCandyKind) {
        _this.unselectables.push(_this.candySprites[r][c]);
      }
    });
  };

  this.startSelecting = function () {

    this.updateUnselectables();

    this.tweenThat(this.backgroundGroup, { alpha: 0.6 });
    this.tweenThese(this.unselectables, { alpha: 0.3 });
  };

  this.endSelecting = function () {

    this.tweenThat(this.backgroundGroup, { alpha: 1 });
    this.tweenThese(this.unselectables, { alpha: 1 });

    this.unselectables = [];
  };


  this.addToSelection = function (pos) {
  console.log('adding', Monsta.Board.selection.length, pos)
    Monsta.Board.selection.push(pos);

    this.tweenThat(this.candySprites[pos.row][pos.col].scale,
      { x: Monsta.Board.config.candyScale * 1.2, y: Monsta.Board.config.candyScale * 1.2 });
    this.bgSprites[pos.row][pos.col].loadTexture('hex-glow', 0);
    // add arrow
  };

  this.removeFromSelection = function () {
    if (Monsta.Board.selection.length == 0) return;

    var removed = Monsta.Board.selection.pop();

    this.tweenThat(this.candySprites[removed.row][removed.col].scale,
      { x: Monsta.Board.config.candyScale, y: Monsta.Board.config.candyScale });
    this.bgSprites[removed.row][removed.col].loadTexture('hex', 0);
    // remove arrow
  };

  this.clearSelection = function () {
    while (Monsta.Board.selection.length > 0) {
      this.removeFromSelection();
    }
  };

  return this;
};
