Game = function (game) {

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
  this.candySprites = [];

  this.create = function () {

    Board.build();

    this.backgroundGroup = game.add.group();
    this.arrowsGroup = game.add.group();
    this.unselectables = [];

    this.coinSound = game.add.audio('coin', 1, false);

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

    for (r = 0; r < Board.config.size.rows; r++) {
      for (c = 0; c < Board.config.size.cols; c++) {
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
      pos = Board.calculatePosition(col, row);

    sprite = game.add.sprite(pos.x, pos.y, kind);
    sprite.anchor.setTo(0.5, 0.5);

    return sprite;
  };

  this.addCandy = function (col, row) {

    var kind = Board.current[row][col],
      candy = this.addSprite(col, row, kind);

    candy.scale.setTo(Board.config.candyScale, Board.config.candyScale);

    return candy;
  };

  this.addBg = function (col, row) {

    var hex = this.addSprite(col, row, 'hex');

    hex.scale.setTo(Board.config.hexScale, Board.config.hexScale);
    hex.inputEnabled = hex.input.pixelPerfect = true;
    hex.hexPos = { col: col, row: row };

    hex.events.onInputDown.add(this.hexDown, this);
    hex.events.onInputOver.add(this.hexOver, this);

    return hex;
  };

  this.addArrow = function (from, to) {
    var arrowSprite,
      fromPos = Board.calculatePosition(from.col, from.row),
      toPos = Board.calculatePosition(to.col, to.row),
      middlePos = {
        x: (fromPos.x + toPos.x) / 2,
        y: (fromPos.y + toPos.y) / 2
      };


    arrowSprite = this.arrowsGroup.create(middlePos.x, middlePos.y, 'arrow');

    //arrow = game.add.sprite(middlePos.x, middlePos.y, 'arrow');

    arrowSprite.scale.setTo(Board.config.hexScale, Board.config.hexScale);
    arrowSprite.anchor.setTo(0.5, 0.5);
    arrowSprite.rotation = game.physics.angleToXY(arrowSprite, toPos.x, toPos.y);

    return arrowSprite;
  };


  this.hexDown = function (sprite) {
    Board.Selection.add(sprite.hexPos);
    this.startSelecting();
  };

  this.hexOver = function (sprite) {

    var firstCandyKind,
      tryCandy;

    if (Board.Selection.empty()) return;

    firstCandyKind = Board.posToKind(Board.Selection.items[0]);
    tryCandy = Board.spriteToKind(sprite);

    if (firstCandyKind != tryCandy) return;

    if (Board.Selection.items.length > 1 &&
      Board.Selection.areSame(sprite.hexPos, Board.Selection.penultimate())) {
      Board.Selection.remove();
    } else if (Board.areAdjacent(Board.Selection.last(), sprite.hexPos)) {
      Board.Selection.add(sprite.hexPos);
    }
  };

  this.hexUp = function () {

    this.endSelecting();
    Board.Selection.clear();
  };

  this.updateUnselectables = function () {
    var firstCandyKind = Board.posToKind(Board.Selection.first());
    this.forEachPiece(function (c, r) {
      if (Board.current[r][c] != firstCandyKind) {
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

  Board.Selection.onAdd = function (added) {

    _this.tweenThat(_this.candySprites[added.row][added.col].scale,
      { x: Board.config.candyScale * 1.2, y: Board.config.candyScale * 1.2 });

    _this.bgSprites[added.row][added.col].loadTexture('hex-glow', 0);

    if (Board.Selection.items.length > 1) {
      _this.addArrow(Board.Selection.penultimate(), Board.Selection.last());
    }

    _this.coinSound.play('', 0, 0.2 + 0.05 * Board.Selection.items.length, false);
  };

  Board.Selection.onRemove = function (removed) {

    _this.tweenThat(_this.candySprites[removed.row][removed.col].scale,
      { x: Board.config.candyScale, y: Board.config.candyScale });

    _this.bgSprites[removed.row][removed.col].loadTexture('hex', 0);

    if (_this.arrowsGroup.countLiving() > 0) {
      _this.arrowsGroup.remove(_this.arrowsGroup.getAt(_this.arrowsGroup.countLiving() - 1));
    }

    _this.coinSound.play('', 0, 0.2 + 0.05 * Board.Selection.items.length, false);
  };


  return this;
};
