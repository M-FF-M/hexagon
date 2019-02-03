// Requires hexagon.js, HexGameState.js

/**
 * Delay, in ms, after which a click is recognized as a drag
 * @type {number}
 */
const CLICK_DELAY = 250;

/**
 * Represents a game board of the Hexagon game
 */
class HexGameBoard {
  /**
   * Constructs a new game board
   * @param {object|number} init either an object representing the board layout and move number or one of the preset board layouts (0 - 3 available)
   * @param {HexMenu} [menu] the Hexagon game menu
   */
  constructor(init, menu = null) {
    this._gameState = new HexGameState(init);
    this._canvas = document.createElement('canvas');
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._canvas.style.position = 'absolute';
    this._canvas.style.left = '0px';
    this._canvas.style.top = '0px';
    this._canvas.style.zIndex = '5';
    this._context = this._canvas.getContext('2d');
    this._scale = 1;
    this._origin = [window.innerWidth / 2, window.innerHeight / 2];
    document.body.appendChild(this._canvas);
    
    this._hexSize = 100;
    this._xD = this._hexSize * Math.cos(Math.PI / 6);
    this._yD = this._hexSize * Math.sin(Math.PI / 6);
    this._hoverCoords = [-1, -1];

    this._mouseDownTime = 0;
    this._lastMouseCoords = [0, 0];
    this._mouseIsDown = false;

    this._isShutDown = false;
    this._noOps = false;
    this._menu = menu;

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('wheel', evt => this.mouseWheel(evt));
    window.addEventListener('keyup', evt => this.keyPress(evt));
    this._canvas.addEventListener('mousedown', evt => this.mouseDown(evt));
    this._canvas.addEventListener('mouseup', evt => this.mouseUp(evt));
    this._canvas.addEventListener('click', evt => this.mouseClick(evt));
    this._canvas.addEventListener('mouseleave', evt => this.mouseLeave(evt));
    this._canvas.addEventListener('mousemove', evt => this.mouseMove(evt));
    this.redraw();
  }

  /**
   * Reactivate commands
   */
  reactivate() {
    if (this._isShutDown) return;
    this._noOps = false;
  }

  /**
   * Remove this board from the webpage
   */
  shutDown() {
    if (this._isShutDown) return;
    document.body.removeChild(this._canvas);
    this._isShutDown = true;
  }

  /**
   * Adapts the canvas to the window size
   */
  resize() {
    if (this._isShutDown) return;
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this.redraw();
  }

  /**
   * Redraws the current game board
   */
  redraw() {
    if (this._isShutDown) return;
    this._hoverCoords = [-1, -1];
    let totMov = this._gameState.totalMoves;
    let maxSum = 0; for (let i = 0; i < 6; i++) maxSum += totMov - i > 0 ? totMov - i : 0;
    let maxMaxSum = totMov * (totMov + 1) / 2;
    let [hexSize, xD, yD] = [this._hexSize, this._xD, this._yD];
    let [con, scale, board, fieldVals] = [this._context, this._scale, this._gameState.board, this._gameState.fieldVals];
    let [width, height] = [board[0].length, board.length];
    let [xO, yO] = [this._origin[0] - (width - 1) * xD * scale, this._origin[1] + (height - 1) * (hexSize + yD) * scale / 2];

    con.clearRect(0, 0, window.innerWidth, window.innerHeight);

    con.save();
    con.translate(xO, yO);
    con.scale(scale, scale);
    con.font = Math.round(hexSize / 2) + 'px Arial';
    con.textAlign = 'center';
    con.textBaseline = 'middle';
    con.lineWidth = 10;
    for (let y = 0; y < height; y++) {
      let by = height - y - 1;
      for (let x = 0; x < width; x++) {
        if (!isNaN(board[by][x])) {
          let xp = x * (2 * xD) + (Math.abs(y) % 2 ? xD : 0);
          let yp = - y * (hexSize + yD);
          let actx = xO + xp * scale;
          let acty = yO + yp * scale;

          con.beginPath();
          con.moveTo(xp - xD, yp - hexSize / 2);
          con.lineTo(xp - xD, yp + hexSize / 2);
          con.lineTo(xp, yp + hexSize / 2 + yD);
          con.lineTo(xp + xD, yp + hexSize / 2);
          con.lineTo(xp + xD, yp - hexSize / 2);
          con.lineTo(xp, yp - hexSize / 2 - yD);
          con.lineTo(xp - xD, yp - hexSize / 2);
          con.closePath();

          let dx = actx - this._lastMouseCoords[0]; let dy = acty - this._lastMouseCoords[1];
          if (board[by][x] == 0 && Math.sqrt(dx * dx + dy * dy) < scale * xD) {
            this._hoverCoords = [x, y];
            con.fillStyle = 'rgba(218, 205, 155, 1)';
            con.fill();
          } else if (board[by][x] == 0) {
            con.fillStyle = 'rgba(228, 246, 238, 1)';
            con.fill();
          } else if (board[by][x] < 0) { // player 2
            con.fillStyle = 'rgba(193, 74, 64, 1)';
            con.fill();
          } else if (board[by][x] > 0) { // player 1
            con.fillStyle = 'rgba(72, 180, 145, 1)';
            con.fill();
          }

          if (board[by][x] == 0) {
            if (fieldVals[by][x] != 0) {
              let importance = Math.abs(fieldVals[by][x]) / maxSum;
              importance = 0.1 + (1 - (importance - 1) * (importance - 1)) * 0.9;
              if (fieldVals[by][x] < 0) // good for player 1
                con.fillStyle = `rgba(72, 180, 145, ${importance})`;
              else if (fieldVals[by][x] > 0) // good for player 2
                con.fillStyle = `rgba(193, 74, 64, ${importance})`;
              con.fillText(fieldVals[by][x], xp, yp);
            }
          } else {
            let importance = Math.abs(board[by][x]) / totMov;
            importance = 0.1 + importance * 0.9;
            con.fillStyle = `rgba(255, 255, 255, ${importance})`;
            con.fillText(board[by][x], xp, yp);
          }
        }
      }
    }

    for (let y = 0; y < height; y++) {
      let by = height - y - 1;
      for (let x = 0; x < width; x++) {
        if (!isNaN(board[by][x])) {
          let xp = x * (2 * xD) + (Math.abs(y) % 2 ? xD : 0);
          let yp = - y * (hexSize + yD);

          con.strokeStyle = 'rgba(36, 63, 65, 1)';
          con.beginPath();
          con.moveTo(xp - xD, yp - hexSize / 2);
          con.lineTo(xp - xD, yp + hexSize / 2);
          con.lineTo(xp, yp + hexSize / 2 + yD);
          con.lineTo(xp + xD, yp + hexSize / 2);
          con.lineTo(xp + xD, yp - hexSize / 2);
          con.lineTo(xp, yp - hexSize / 2 - yD);
          con.lineTo(xp - xD, yp - hexSize / 2);
          con.closePath();
          con.stroke();
        }
      }
    }

    let winner = this._gameState.checkWinner();
    con.font = Math.round(hexSize / 2) + 'px Merriweather';
    let texty = - (height - 1) * (hexSize + yD) / 2;
    let texty1 = hexSize + yD;
    let texty2 = - height * (hexSize + yD);
    let textx = (width - 1) * xD;
    con.fillStyle = 'rgba(36, 63, 65, 1)';
    con.fillText(`Current sum: ${this._gameState.sum}${!isNaN(winner) && winner == 0 ? ', game ended in draw' : ''}`, textx, texty1);
    con.fillText(this._gameState.name, textx, texty2);

    let p1width = con.measureText('Player 1').width;
    let p2width = con.measureText('Player 1').width;
    con.fillStyle = 'rgba(72, 180, 145, 1)';
    con.fillText('Player 1', - xD * 2 - p1width / 2, texty);
    con.fillStyle = 'rgba(193, 74, 64, 1)';
    con.fillText('Player 2', (textx + xD) * 2 + p2width / 2, texty);
    if (this._gameState.sum != 0) {
      let importance = Math.abs(this._gameState.sum) / maxMaxSum;
      importance = 0.1 + (1 + (importance - 1) * (importance - 1) * (importance - 1)) * 0.9;
      let text = 'seems to win!';
      if (!isNaN(winner)) { text = 'won!'; importance = 1; }
      let twidth = con.measureText(text).width;
      if (this._gameState.sum < 0) {
        con.fillStyle = `rgba(72, 180, 145, ${importance})`;
        con.fillText(text, - xD * 2 - twidth / 2, texty + hexSize * 0.66);
      } else if (this._gameState.sum > 0) {
        con.fillStyle = `rgba(193, 74, 64, ${importance})`;
        con.fillText(text, (textx + xD) * 2 + twidth / 2, texty + hexSize * 0.66);
      }
    }

    con.restore();
  }

  /**
   * Zoom in
   */
  zoomIn() {
    if (this._isShutDown) return;
    if (this._scale < 10) {
      let xc = window.innerWidth / 2;
      let yc = window.innerHeight / 2;
      this._origin = [xc + (this._origin[0] - xc) * 1.5, yc + (this._origin[1] - yc) * 1.5];
      this._scale *= 1.5;
      this._checkOrigin();
      this.redraw();
    }
  }

  /**
   * Zoom out
   */
  zoomOut() {
    if (this._isShutDown) return;
    if (this._scale > 0.1) {
      let xc = window.innerWidth / 2;
      let yc = window.innerHeight / 2;
      this._origin = [xc + (this._origin[0] - xc) / 1.5, yc + (this._origin[1] - yc) / 1.5];
      this._scale /= 1.5;
      this._checkOrigin();
      this.redraw();
    }
  }

  _checkOrigin() {
    if (this._isShutDown) return;
    let xc = window.innerWidth / 2;
    let yc = window.innerHeight / 2;
    let [hexSize, xD, yD, scale, board] = [this._hexSize, this._xD, this._yD, this._scale, this._gameState.board];
    let [width, height] = [board[0].length, board.length];
    let w = (width - 1) * xD * scale;
    let h = (height - 1) * (hexSize + yD) * scale / 2;
    let minX = xc - w;
    let maxX = xc + w;
    let minY = yc - h;
    let maxY = yc + h;
    if (this._origin[0] < minX) this._origin[0] = minX;
    if (this._origin[0] > maxX) this._origin[0] = maxX;
    if (this._origin[1] < minY) this._origin[1] = minY;
    if (this._origin[1] > maxY) this._origin[1] = maxY;
  }

  _translate(nX, nY) {
    if (this._isShutDown) return;
    const dx = this._lastMouseCoords[0] - nX;
    const dy = this._lastMouseCoords[1] - nY;
    this._origin[0] -= dx;
    this._origin[1] -= dy;
    this._checkOrigin();
    this.redraw();
  }

  /**
   * Should be called when a key was pressed
   * @param {object} evt the event object
   */
  keyPress(evt) {
    if (this._isShutDown || this._noOps) return;
    const key = evt.key.toLowerCase();
    if (key === '+') {
      evt.preventDefault();
      this.zoomIn();
    } else if (key === '-') {
      evt.preventDefault();
      this.zoomOut();
    } else if (key === 'm' && this._menu) {
      evt.preventDefault();
      this._menu.openMenu();
      this._noOps = true;
    }
  }

  /**
   * Should be called when the mouse wheel event is fired
   * @param {object} evt the event object
   */
  mouseWheel(evt) {
    if (this._isShutDown || this._noOps) return;
    if (evt.deltaY < 0) {
      evt.preventDefault();
      this.zoomIn();
    } else if (evt.deltaY > 0) {
      evt.preventDefault();
      this.zoomOut();
    }
  }

  /**
   * Should be called when the mouse down event is fired
   * @param {object} evt the event object
   */
  mouseDown(evt) {
    if (this._isShutDown || this._noOps) return;
    this._mouseDownTime = (new Date()).getTime();
    this._mouseIsDown = true;
    this._lastMouseCoords = [evt.clientX, evt.clientY];
  }

  /**
   * Should be called when the mouse up event is fired
   * @param {object} evt the event object
   */
  mouseUp(evt) {
    if (this._isShutDown || this._noOps) return;
    if ((new Date()).getTime() - this._mouseDownTime >= CLICK_DELAY) {
      this._translate(evt.clientX, evt.clientY);
    }
    this._mouseIsDown = false;
    this._lastMouseCoords = [evt.clientX, evt.clientY];
  }

  /**
   * Should be called when the mouse click event is fired
   * @param {object} evt the event object
   */
  mouseClick(evt) {
    if (this._isShutDown || this._noOps) return;
    this._lastMouseCoords = [evt.clientX, evt.clientY];
    if ((new Date()).getTime() - this._mouseDownTime < CLICK_DELAY) {
      this.redraw();
      if (this._hoverCoords[0] != -1) {
        let nState = this._gameState.play(this._hoverCoords[0], this._hoverCoords[1]);
        if (nState !== false) this._gameState = nState;
        this.redraw();
      }
    }
  }

  /**
   * Should be called when the mouse leave event is fired
   * @param {object} evt the event object
   */
  mouseLeave(evt) {
    if (this._isShutDown || this._noOps) return;
    if (this._mouseIsDown && ((new Date()).getTime() - this._mouseDownTime >= CLICK_DELAY)) {
      this._translate(evt.clientX, evt.clientY);
    }
    this._mouseIsDown = false;
    this._lastMouseCoords = [-1, -1];
  }

  /**
   * Should be called when the mouse move event is fired
   * @param {object} evt the event object
   */
  mouseMove(evt) {
    if (this._isShutDown || this._noOps) return;
    if (this._mouseIsDown && ((new Date()).getTime() - this._mouseDownTime >= CLICK_DELAY)) {
      this._translate(evt.clientX, evt.clientY);
    }
    this._lastMouseCoords = [evt.clientX, evt.clientY];
    this.redraw();
  }
}