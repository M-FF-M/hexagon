/**
 * Non-optimized Hexagon game solver
 */
class HexSolver {
  /**
   * Create a new game solver for a given state
   * @param {HexGameState} state the state to solve
   * @param {number} [timelimit] the time limit, in ms
   */
  constructor(state, timelimit = 1000) {
    this._timelimit = timelimit;
    this._starttime = -1;
    this._state = state;
  }

  /**
   * Solve the given state (can only be called once per instance)
   * @return {number} -1 if player 1 wins, 1 if player 2 wins, 0 for a draw, NaN for timelimit or already running
   */
  solve() {
    if (this._starttime >= 0) return NaN;
    this._starttime = (new Date()).getTime();
    return this._solveState(this._state, 2 * (this._state.currentMove % 2) - 1)
  }

  _optCheck(win, res, mov) {
    if (mov == 1) {
      if (res > win) return res;
      return win;
    } else {
      if (res < win) return res;
      return win;
    }
  }

  _solveState(state, mov) {
    if ((new Date()).getTime() - this._starttime > this._timelimit) return NaN;
    let winner = state.checkWinner();
    if (isNaN(winner)) {
      let win = mov * (-1);
      for (let y = 0; y < state.board.length && win != mov; y++) {
        for (let x = 0; x < state.board[y].length && win != mov; x++) {
          if (state.board[y][x] == 0) {
            let nState = state.play(x, state.board.length - y - 1);
            let res = this._solveState(nState, mov * (-1));
            if (isNaN(res)) return NaN;
            win = this._optCheck(win, res, mov);
          }
        }
      }
      return win;
    } else {
      return winner;
    }
  }
}

/**
 * Get the move options
 * @param {HexGameState} state the state to solve
 * @param {number} [timelimit] the time limit, in ms
 * @return {number[][]} an empty array if the timelimit was reached, otherwise an array containing -1, 0, 1, indicating who would win with this move
 */
function getOptions(state, timelimit = 1000) {
  let start = (new Date()).getTime();
  let resBoard = [];
  let cWinner = state.checkWinner();
  for (let y = 0; y < state.board.length; y++) {
    resBoard[y] = [];
    for (let x = 0; x < state.board[y].length; x++) {
      if (state.board[y][x] == 0) {
        let nState = state.play(x, state.board.length - y - 1);
        if (nState !== false) {
          let solver = new HexSolver(nState, timelimit - ((new Date()).getTime() - start));
          resBoard[y][x] = solver.solve();
          if (isNaN(resBoard[y][x])) return [];
        } else {
          resBoard[y][x] = isNaN(cWinner) ? 0 : cWinner;
        }
      } else {
        resBoard[y][x] = 0;
      }
    }
  }
  return resBoard;
}