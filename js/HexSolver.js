// Requires hexagon.js, AbstractHexState.js

/**
 * Converts a game state into an optimized format, if possible
 * @param {AbstractHexState} state the game state
 * @return {AbstractHexState} the state in optimized format (or the old state, if optimization was not possible)
 */
function toOptIfPossible(state) {
  if (state instanceof HexGameState) {
    let nFields = 0;
    for (let y = 0; y < state.board.length; y++) {
      for (let x = 0; x < state.board[y].length; x++)
        nFields += isNaN(state.board[y][x]) ? 0 : 1;
    }
    if (nFields == state.totalMoves * 2 + 1)
      state = fromHexGameState(state); // use the optimized version if only one field remains empty
  }
  return state;
}

/**
 * Non-optimized Hexagon game solver
 */
class HexSolver {
  /**
   * Create a new game solver for a given state
   * @param {AbstractHexState} state the state to solve
   * @param {number} [timelimit] the time limit, in ms; pass NaN for no time limit
   */
  constructor(state, timelimit = 1000) {
    this._timelimit = timelimit;
    this._starttime = -1;
    this._state = state;
    this._statesSeen = 0;
  }

  /**
   * The number of states that were considered while solving the board position
   * @return {number} the number of states
   */
  get searchspaceSize() {
    return this._statesSeen;
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
    if (!isNaN(this._timelimit) && ((new Date()).getTime() - this._starttime > this._timelimit)) return NaN;
    this._statesSeen++;
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
 * Randomized Hexagon game solver
 */
class HexRandomSolver {
  /**
   * Create a new game solver for a given state
   * @param {AbstractHexState} state the state to solve
   * @param {number} freeFields the current number of empty fields
   * @param {number} switchDepth if only switchDepth number of fields are empty, the BF solver will be used
   * @param {number} [timelimit] the time limit, in ms
   */
  constructor(state, freeFields, switchDepth, timelimit = 1000) {
    this._freeFields = freeFields;
    if (this._freeFields < 2) throw new Error('There must be at least two free fields for a state to be worth solving!');
    this._switchDepth = switchDepth;
    this._timelimit = timelimit;
    this._starttime = -1;
    this._state = state;
    this._samplesTaken = 0;
    this._acc = 0;
  }

  /**
   * The number of samples that were taken
   * @return {number} the number of samples
   */
  get sampleNumber() {
    return this._samplesTaken;
  }

  /**
   * Solve the given state (can only be called once per instance)
   * @return {number} a value in the interval [-1, 1], NaN for already running
   */
  solve() {
    if (this._starttime >= 0) return NaN;
    this._starttime = (new Date()).getTime();
    return this._solveState(this._state);
  }

  _solveState(state) {
    while ((new Date()).getTime() - this._starttime <= this._timelimit) {
      let ff = this._freeFields;
      let cstate = state;
      let rnd_sub = 0;
      if (this._switchDepth > 1)
        rnd_sub = Math.round(Math.random()); // randomly subtract 1 so both players sometimes move first when BF kicks in
      while (ff > this._switchDepth - rnd_sub) {
        let field = Math.floor(Math.random() * ff);
        let cnt = 0;
        for (let y = 0; y < cstate.board.length && cnt <= field; y++) {
          for (let x = 0; x < cstate.board[y].length && cnt <= field; x++) {
            if (cstate.board[y][x] == 0) {
              if (cnt == field) {
                cstate = cstate.play(x, cstate.board.length - y - 1);
              }
              cnt++;
            }
          }
        }
        ff--;
      }
      let res = (new HexSolver(cstate, NaN)).solve();
      if (!isNaN(res)) {
        this._samplesTaken++;
        this._acc += res;
      }
    }
    return this._acc / this._samplesTaken;
  }
}

/**
 * Get the move options via brute force
 * @param {AbstractHexState} state the state to solve
 * @param {number} [timelimit] the time limit, in ms
 * @return {number[][][]} an array with two values - at index 0: an empty array if the timelimit was reached, otherwise an array containing -1, 0, 1,
 * indicating who would win with this move / at index 1: the number of states that were visited during BF search
 */
function getOptionsBF(state, timelimit = 1000) {
  let start = (new Date()).getTime();
  let resBoard = [];
  let cWinner = state.checkWinner();
  let stateNum = 0;
  for (let y = 0; y < state.board.length; y++) {
    resBoard[y] = [];
    for (let x = 0; x < state.board[y].length; x++) {
      if (state.board[y][x] == 0) {
        let nState = state.play(x, state.board.length - y - 1);
        if (nState !== false) {
          let solver = new HexSolver(nState, timelimit - ((new Date()).getTime() - start));
          resBoard[y][x] = solver.solve();
          stateNum += solver.searchspaceSize;
          if (isNaN(resBoard[y][x])) return [[], stateNum];
        } else {
          resBoard[y][x] = isNaN(cWinner) ? 0 : cWinner;
        }
      } else {
        resBoard[y][x] = 0;
      }
    }
  }
  return [resBoard, stateNum];
}

/**
 * Get the move options via random sampling
 * @param {AbstractHexState} state the state to solve
 * @param {number} statesInLimit a number indicating the number of states that can be evaluated within the timelimit
 * @param {number} [timelimit] the time limit, in ms
 * @return {number[][][]} an array with two values - at index 0: an empty array if an error ocurred, or an array containing numbers in the interval [-1, 1]
 * indicating the move value gained by random sampling / at index 1: the number of random samples that were taken
 */
function getOptionsRand(state, statesInLimit, timelimit = 1000) {
  let timePerState = timelimit / statesInLimit;
  let freeFields = 0; let nFields = 0;
  for (let y = 0; y < state.board.length; y++) {
    for (let x = 0; x < state.board[y].length; x++) {
      freeFields += state.board[y][x] == 0 ? 1 : 0;
      nFields += isNaN(state.board[y][x]) ? 0 : 1;
    }
  }
  let f = nFields - state.totalMoves * 2; let d = 1;
  while (f * timePerState <= timelimit / 4000 && d < freeFields) {
    d++; f = d * f;
  }
  d += nFields - state.totalMoves * 2 - 1;
  let sampleNum = 0;
  let resBoard = [];
  let cWinner = state.checkWinner();
  for (let y = 0; y < state.board.length; y++) {
    resBoard[y] = [];
    for (let x = 0; x < state.board[y].length; x++) {
      if (state.board[y][x] == 0) {
        let nState = state.play(x, state.board.length - y - 1);
        if (nState !== false) {
          let solver = new HexRandomSolver(nState, freeFields - 1, d, timelimit / freeFields);
          resBoard[y][x] = solver.solve();
          sampleNum += solver.sampleNumber;
          if (isNaN(resBoard[y][x])) return [[], sampleNum];
        } else {
          resBoard[y][x] = isNaN(cWinner) ? 0 : cWinner;
        }
      } else {
        resBoard[y][x] = 0;
      }
    }
  }
  return [resBoard, sampleNum];
}

/**
 * Get a value for every possible move. For half of the provided time limit, a brute force search will be executed. If it fails, the other half of the time
 * will be used for random move sampling.
 * @param {AbstractHexState} state the state to solve
 * @param {number} [timelimit] the time limit, in ms
 * @return {number[][]} an array containing -1, 0, 1, indicating who would win with this move if BF was succesfull, otherwise an array containing numbers
 * in the interval [-1+3, 1+3] indicating the move value gained by random sampling.
 */
function getOptionValues(state, timelimit = 2000) {
  if (isNaN(state.checkWinner()) && WASM_WAS_LOADED) {
    let nFields = 0;
    let backArr = [];
    let fieldArr = [];
    let adjArr = [];
    for (let y = 0; y < state.board.length; y++) {
      backArr[y] = [];
      for (let x = 0; x < state.board[y].length; x++) {
        nFields += isNaN(state.board[y][x]) ? 0 : 1;
        if (!isNaN(state.board[y][x])) {
          fieldArr.push([x, y]);
          backArr[y][x] = fieldArr.length - 1;
          adjArr.push([]);
          let adj_idx = adjArr.length - 1;
          let neighb = getNeighbors([x, y], state.board.length);
          for (let i = 0; i < neighb.length; i++) {
            let [x2, y2] = neighb[i];
            if (x2 >= 0 && x2 < state.board[0].length && y2 >= 0 && y2 < state.board.length && !isNaN(state.board[y2][x2])) {
              adjArr[adj_idx].push([x2, y2]);
            }
          }
        } else {
          backArr[y][x] = -1;
        }
      }
    }
    if (nFields <= 101 && nFields == state.totalMoves * 2 + 1) { // only one field remains empty, try to use the optimized WASM BF solution
      let cInitArray = [];
      cInitArray.push(nFields);
      cInitArray.push((1 + Math.floor(state.currentMove / 2)) * (state.currentMove % 2 ? -1 : 1) * (-1)); // ! C++ solution uses inverted numbers
      for (let i = 0; i < adjArr.length; i++) {
        for (let k = 0; k < adjArr[i].length; k++) {
          let [x, y] = adjArr[i][k];
          cInitArray.push(backArr[y][x]);
        }
        cInitArray.push(-1);
      }
      let cStateArray = [];
      for (let i = 0; i < fieldArr.length; i++) {
        let [x, y] = fieldArr[i];
        cStateArray.push(-state.board[y][x]); // ! C++ solution uses inverted numbers
      }

      let sol_found = false; let resBoard = [];
      let cArray1 = WASM_CreateArr(cInitArray);
      let cArray2 = WASM_CreateArr(cStateArray);
      WASM_CallArrFct('init_adj', cArray1);
      WASM_CallArrFct('init_state', cArray2);
      let sol = WASM_CallArrFct('solve_current', cArray2, 'number');
      if (Math.abs(sol) < 2000) {
        sol_found = true;
        // console.log('Used WASM!');
        let solArray = WASM_ReadArr(cArray2, cStateArray.length);
        for (let y = 0; y < state.board.length; y++) {
          resBoard[y] = [];
          for (let x = 0; x < state.board[y].length; x++) {
            if (state.board[y][x] == 0) {
              let idx = backArr[y][x];
              if (solArray[idx] > 0) resBoard[y][x] = state.currentMove % 2 ? 1 : -1;
              else if (solArray[idx] < 0) resBoard[y][x] = state.currentMove % 2 ? -1 : 1;
              else resBoard[y][x] = 0;
            } else {
              resBoard[y][x] = 0;
            }
          }
        }
      } else {
        // console.log('WASM time limit!');
      }
      WASM_FreeArr(cArray1);
      WASM_FreeArr(cArray2);
      if (sol_found) return resBoard;
    }
  }
  state = toOptIfPossible(state);
  let [resBoard, stateNum] = getOptionsBF(state, timelimit / 2);
  if (resBoard.length === 0) {
    [resBoard, stateNum] = getOptionsRand(state, stateNum, timelimit / 2);
    for (let y = 0; y < resBoard.length; y++) {
      for (let x = 0; x < resBoard[y].length; x++)
        resBoard[y][x] += 3;
    }
  }
  return resBoard;
}