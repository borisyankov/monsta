Board = (function () {


  this.Selection = (function () {

    var _this = this;

    this.items = [];

    this.onAdd = function (pos) {
    };
    this.onRemove = function (pos) {
    };
    this.onBeforeEnd = function () {
    };

    this.empty = function () {
      return this.items.length == 0;
    };

    this.add = function (pos) {

      if (this.exists(pos)) return;

      _this.items.push(pos);
      _this.onAdd(pos);
    };

    this.remove = function () {

      var pos = _this.items.pop();
      _this.onRemove(pos);
    };

    this.end = function () {

      if (_this.items.length < 3) {
        while (_this.items.length > 0) {
          _this.remove();
        }
      } else {
        _this.onBeforeEnd();
        _this.items = [];
      }
    };

    this.first = function () {
      return _this.items[0];
    };

    this.last = function () {
      return _this.items[_this.items.length - 1];
    };

    this.penultimate = function () {
      return _this.items[_this.items.length - 2];
    };

    this.areSame = function (one, two) {
      return (one.col == two.col && one.row == two.row);
    };

    this.exists = function (pos) {

      var found = false;
      _this.items.forEach(function (item) {
        if (_this.areSame(item, pos)) {
          found = true;
        }
      });
      return found;
    };

    return this;

  })();


  this.config = {
    pieces: ['circlet', 'bonbon', 'sweet', 'diamond'],
    size: { cols: 9, rows: 6 },
    hexWidth: 200,
    hexScale: 200 / 400,
    candyScale: 200 / 400 / 1.8
  };

  function generateBoard() {
    var c, r, board = [];
    for (r = 0; r < this.config.size.rows; r++) {
      board[r] = [];
      for (c = 0; c < this.config.size.cols; c++) {
        board[r][c] = generatePiece();
      }
    }

    return board;
  }

  function generatePiece() {
    var rnd = Math.floor(Math.random() * this.config.pieces.length);
    return this.config.pieces[rnd];
  }

  this.build = function () {
    this.current = generateBoard();
  };


  this.replaceMatched = function () {
    this.Selection.items.forEach(function (i) {
      this.current[i.row][i.col] = generatePiece();
    });
  }

  this.posToKind = function (pos) {
    return this.current[pos.row][pos.col];
  };

  this.spriteToKind = function (sprite) {
    return this.current[sprite.hexPos.row][sprite.hexPos.col];
  };

  this.hexHeight = function (width) {
    return Math.sqrt(width * width * 3 / 4);
  };

  this.calculatePosition = function (col, row) {
    var
      hexHeight = this.hexHeight(this.config.hexWidth),
      offsetX = col % 2 ? 0 : 0,
      offsetY = col % 2 ? hexHeight / 4 : 0,
      centerX = col * (this.config.hexWidth * 3 / 8) + offsetX + 80,
      centerY = row * hexHeight / 2 + offsetY + 200;

    return { x: centerX, y: centerY };
  };

  this.areAdjacent = function (a, b) {

    var offsetY = (a.col % 2) * -1,
      adjacentRow = (a.row == b.row - 1 || a.row == b.row + 1),
      adjacentCol = (a.col == b.col - 1 || a.col == b.col + 1);

    return (a.col == b.col && adjacentRow) ||
      (adjacentCol && (a.row == b.row + offsetY || a.row == b.row + 1 + offsetY));
  };


  return this;
})();