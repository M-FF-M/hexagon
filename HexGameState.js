// Requires hexagon.js

/**
 * Represents blocked fields
 * @type {number}
 */
const X = NaN;

/**
 * An array with default board layouts
 * @type {object[]}
 */
const DEFAULT_BOARDS = [
  {
    name: 'THE Triangle',
    board: [
      [X, X, 0, X, X],
        [X, 0, 0, X, X],
      [X, 0, 0, 0, X],
        [0, 0, 0, 0, X],
      [0, 0, 0, 0, 0],
    ],
    moves: 7,
  },
  {
    name: 'Small Hexagon',
    board: [
      [X, 0, 0, X],
        [0, 0, 0, X],
      [X, 0, 0, X],
    ],
    moves: 3,
  },
  {
    name: 'THE Hexagon',
    board: [
      [X, 0, 0, 0, X],
        [0, 0, 0, 0, X],
      [0, 0, 0, 0, 0],
        [0, 0, 0, 0, X],
      [X, 0, 0, 0, X],
    ],
    moves: 9,
  },
  {
    name: 'THE Line',
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    moves: 4,
  },
  {
    name: 'THE Wheel',
    board: [
      [X, 0, 0, 0, X],
        [0, X, X, 0, X],
      [0, 0, 0, 0, 0],
        [0, X, X, 0, X],
      [X, 0, 0, 0, X],
    ],
    moves: 7,
  },
];

/**
 * Calculates the sums on the empty field
 * @param {number[][]} board the current board state
 * @return {any[]} an array - at index 0: an array with the sums for each field / at index 1: the overall sum
 */
function calcSums(board) {
  let retBoard = [];
  let retSum = 0;
  for (let yc = 0; yc < board.length; yc++) {
    retBoard[yc] = [];
    for (let xc = 0; xc < board[yc].length; xc++)
      retBoard[yc][xc] = board[yc][xc] !== 0 ? X : 0;
  }
  for (let yc = 0; yc < board.length; yc++) {
    for (let xc = 0; xc < board[yc].length; xc++) {
      if (!isNaN(board[yc][xc])) {
        let addNewVal = false;
        let neighb = getNeighbors([xc, yc]);
        for (let i = 0; i < neighb.length; i++) {
          let [x2, y2] = neighb[i];
          if (x2 >= 0 && x2 < board[0].length && y2 >= 0 && y2 < board.length && !isNaN(retBoard[y2][x2])) {
            retBoard[y2][x2] += board[yc][xc];
            addNewVal = true;
          }
        }
        if (addNewVal) retSum += board[yc][xc];
      }
    }
  }
  return [retBoard, retSum];
}

/**
 * Represents a game state of the Hexagon game
 */
class HexGameState {
  /**
   * Constructs a new game state
   * @param {object|number} init either an object representing the board layout and move number or one of the preset board layouts (0 - 4 available)
   */
  constructor(init) {
    /**
     * The total number of moves per player
     * @type {number}
     */
    this.totalMoves = 0;
    /**
     * The number of moves which were already played
     * @type {number}
     */
    this.currentMove = 0;
    /**
     * The current board
     * @type {number[][]}
     */
    this.board = [];
    /**
     * The name of the board layout
     * @type {string}
     */
    this.name = '';
    /**
     * The current sums on all the empty fields
     * @type {number[][]}
     */
    this.fieldVals = [];
    /**
     * The current overall sum on the empty fields
     * @type {number}
     */
    this.sum = 0;
    if (typeof init === 'number') {
      this.totalMoves = DEFAULT_BOARDS[init].moves;
      this.board = DEFAULT_BOARDS[init].board;
      this.name = DEFAULT_BOARDS[init].name;
    } else {
      this.totalMoves = init.moves;
      this.board = init.board;
      if (init.name) this.name = init.name;
      if (init.currentMove) this.currentMove = init.currentMove;
      if (init.fieldVals && (typeof init.sum === 'number')) { this.fieldVals = init.fieldVals; this.sum = init.sum; }
    }
    if (this.fieldVals.length == 0) {
      let [fV, s] = calcSums(this.board);
      this.fieldVals = fV;
      this.sum = s;
    }
  }

  /**
   * Perform a move
   * @param {number} x the x coordinate of the field the next number should be placed on
   * @param {number} y the y coordinate of the field the next number should be placed on
   * @return {boolean|HexGameState} false if the move was invalid, the new game state if it was valid
   */
  play(x, y) {
    if (Math.floor(this.currentMove / 2) >= this.totalMoves) return false;
    if (x < 0 || x >= this.board[0].length) return false;
    if (y < 0 || y >= this.board.length) return false;
    y = this.board.length - y - 1;
    if (this.board[y][x] !== 0) return false;

    let nextNumber = (1 + Math.floor(this.currentMove / 2)) * (this.currentMove % 2 ? -1 : 1);
    let newBoard = []; let nfv = [];
    for (let yc = 0; yc < this.board.length; yc++) {
      newBoard[yc] = []; nfv[yc] = [];
      for (let xc = 0; xc < this.board[yc].length; xc++) {
        newBoard[yc][xc] = yc == y && xc == x ? nextNumber : this.board[yc][xc];
        nfv[yc][xc] = yc == y && xc == x ? X : this.fieldVals[yc][xc];
      }
    }

    let ns = this.sum;
    let addNewVal = false;
    let neighb = getNeighbors([x, y]);
    for (let i = 0; i < neighb.length; i++) {
      let [x2, y2] = neighb[i];
      if (x2 >= 0 && x2 < this.board[0].length && y2 >= 0 && y2 < this.board.length && !isNaN(this.board[y2][x2])) {
        if (!isNaN(nfv[y2][x2])) {
          nfv[y2][x2] += nextNumber;
          addNewVal = true;
        }
        let removeVal = true;
        let neighb2 = getNeighbors([x2, y2]);
        for (let k = 0; k < neighb2.length; k++) {
          let [x3, y3] = neighb2[k];
          if (x3 >= 0 && x3 < this.board[0].length && y3 >= 0 && y3 < this.board.length && !isNaN(nfv[y3][x3])) {
            removeVal = false;
            break;
          }
        }
        if (removeVal) ns -= this.board[y2][x2];
      }
    }
    if (addNewVal) ns += nextNumber;

    return new HexGameState({ name: this.name, moves: this.totalMoves, currentMove: this.currentMove + 1, board: newBoard, fieldVals: nfv, sum: ns });
  }

  /**
   * Check who won the game
   * @return {number} -1: player 1 (minimizer) won / 1: player 2 (maximizer) won / 0: draw / NaN: game not over yet
   */
  checkWinner() {
    if (Math.floor(this.currentMove / 2) < this.totalMoves) return X;
    if (this.sum < 0) return -1;
    if (this.sum > 0) return 1;
    return 0;
  }
}