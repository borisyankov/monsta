Monsta.Board = (function () {

  this.selection = [];

  this.config = {
    pieces: ['circlet', 'bonbon', 'sweet', 'diamond'],
    size: { cols: 9, rows: 5 },
    hexWidth: 250,
    hexScale: 250 / 400,
    candyScale: 250 / 400 / 1.8
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

  this.posToKind = function (pos) {
    return this.current[pos.row][pos.col];
  };

  this.spriteToKind = function (sprite) {
    return this.current[sprite.hexPos.row][sprite.hexPos.col];
  };

  this.areSame = function(one, two) {
    return (one.col == two.col && one.row == two.row);
  };

  this.hexHeight = function(width) {
    return Math.sqrt(width * width * 3 / 4);
  };

  this.calculatePosition = function(col, row) {
    var
      hexHeight = this.hexHeight(this.config.hexWidth),
      offsetX = col % 2 ? 0 : 0,
      offsetY = col % 2 ? hexHeight / 4 : 0,
      centerX = col * (this.config.hexWidth * 3 / 8) + offsetX + 100,
      centerY = row * hexHeight / 2 + offsetY + 100;

    return { x: centerX, y: centerY };
  };

  this.areAdjacent = function (one, two) {
    return (one.col == two.col && Math.abs(one.row - two.row) == 1)
      || ((one.col - 1 == two.col || one.col + 1 == two.col) && (two.row - one.col <= 1));
  };


  return this;
})();