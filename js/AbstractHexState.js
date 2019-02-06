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
  {
    name: 'Triangle 21',
    board: [
        [X, X, 0, X, X, X],
      [X, X, 0, 0, X, X],
        [X, 0, 0, 0, X, X],
      [X, 0, 0, 0, 0, X],
        [0, 0, 0, 0, 0, X],
      [0, 0, 0, 0, 0, 0],
    ],
    moves: 10,
  },
];

/**
 * Defines which methods have to be available
 */
class AbstractHexState {
  /**
   * Constructs a new game state
   * @param {object|number} init either an object representing the board layout and move number or one of the preset board layouts (see DEFAULT_BOARDS)
   */
  constructor(init) {
  }

  /**
   * The current board position
   * @return {number[][]} the board: NaN fields cannot be played, 0 fields are empty, other numbers represent the numbers that were played so far
   */
  get board() {
    return [];
  }

  /**
   * The current sums on empty fields of the board
   * @return {number[][]} the field values: NaN for non-empty fields, otherwise the sum of the values on neighboring fields
   */
  get fieldVals() {
    return [];
  }

  /**
   * The number of total moves per player
   * @return {number} the total moves
   */
  get totalMoves() {
    return 0;
  }

  /**
   * The current move number
   * @return {number} the current move
   */
  get currentMove() {
    return 0;
  }

  /**
   * The current sum of all numbers bordering on empty fields, or the sum of the values of empty fields in fieldVals
   * @return {number} the current sum
   */
  get sum() {
    return 0;
  }

  /**
   * The name of the game board
   * @return {string} the name
   */
  get name() {
    return '';
  }

  /**
   * Perform a move
   * @param {number} x the x coordinate of the field the next number should be placed on
   * @param {number} y the y coordinate of the field the next number should be placed on
   * @return {boolean|AbstractHexState} false if the move was invalid, the new game state if it was valid
   */
  play(x, y) {
    return false;
  }

  /**
   * Check who won the game
   * @return {number} -1: player 1 (minimizer) won / 1: player 2 (maximizer) won / 0: draw / NaN: game not over yet
   */
  checkWinner() {
    return NaN;
  }
}