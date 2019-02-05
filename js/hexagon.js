
function hexMain() {
  cMenu = new HexMenu();
}

/**
 * Draw a small preview map for a given board
 * @param {HTMLElement} can the canvas
 * @param {CanvasRenderingContext2D} con the context of the canvas
 * @param {object} boardObj an object representing the board layout and move number
 * @param {number} [scale] the scale, 1 means hexagons with a side length of 10 pixels
 */
function drawSmallMap(can, con, boardObj, scale = 1) {
  let board = boardObj.board;
  let hexSize = 10 * scale;
  let xD = hexSize * Math.cos(Math.PI / 6);
  let yD = hexSize * Math.sin(Math.PI / 6);
  can.width = 2 * xD * board[0].length + xD;
  can.height = (hexSize + yD) * board.length + 2 * yD;
  drawHexGrid(con, xD * 1.5, (hexSize + yD) * (board.length - 0.5) + yD, 0.1 * scale, board[0].length, board.length, board)
}

/**
 * Returns the coordinates of a hexagon, depending on the system used
 * @param {number[]} coords the x and y coordinates w.r.t. the standard system: x axis to the right, y axis to the top
 * @param {number} dir the direction of the system the coordinates should be returned in: 0 is standard system, 1 is one clockwise rotation, ... up to 5
 * @return {number[]} the coordinates in the new system
 */
function getCoords(coords, dir) {
  let [x, y] = coords;
  if (dir == 0) return [x, y];
  else if (dir == 1) return [Math.floor((x / 3 - y / 2 + 1 / 4) * 3 / 2), x + Math.ceil(y / 2)];
  else if (dir == 2) return [Math.floor((1 / 12 - x / 3 - y / 2) * 3 / 2), x - Math.floor(y / 2)];
  else if (dir == 3) return [-x - (Math.abs(y) % 2), -y];
  else if (dir == 4) return [-Math.floor((x / 3 - y / 2 + 1 / 4) * 3 / 2) - (Math.abs(x + Math.ceil(y / 2)) % 2), -x - Math.ceil(y / 2)];
  else if (dir == 5) return [-Math.floor((1 / 12 - x / 3 - y / 2) * 3 / 2) - (Math.abs(x - Math.floor(y / 2)) % 2), Math.floor(y / 2) - x];
}

/**
 * Get a list of the neighboring hexagons
 * @param {number[]} coords the x and y coordinates of the current hexagon
 * @param {number} [parity] bit to change the parity of the line numbers (can in fact be any number, will be taken mod 2), 1: don't change
 * @return {number[][]} an array with the coordinates of the six adjoining hexagons
 */
function getNeighbors(coords, parity = 0) {
  let [x, y] = coords;
  if ((Math.abs(y) + parity + 1) % 2) {
    return [
      [x, y+1], [x+1, y+1], [x+1, y], [x+1, y-1], [x, y-1], [x-1, y]
    ];
  } else {
    return [
      [x-1, y+1], [x, y+1], [x+1, y], [x, y-1], [x-1, y-1], [x-1, y]
    ];
  }
}

/**
 * Converts coordinates to a string
 * @param {number[]} coords the coordinates to convert to a string
 * @return {string} the corresponding string
 */
function coordsToString(coords) {
  return `(${Math.round(coords[0] * 1000) / 1000}, ${Math.round(coords[1] * 1000) / 1000})`;
}

/**
 * Draws a hexagon grid
 * @param {CanvasRenderingContext2D} con the context of the canvas the grid should be drawn on
 * @param {number} [xO] the x coordinate of the grid origin in pixels
 * @param {number} [yO] the y coordinate of the grid origin in pixels
 * @param {number} [scale] the scale, 1 means hexagons with a side length of 100 pixels
 * @param {number} [width] the number of hexagons to be drawn to the right and left of the origin
 * @param {number} [height] the number of hexagons to be drawn to the top and bottom of the origin
 * @param {number[][]} [posArr] an array specifying where to draw the hexagons, NaN specifies not to draw a hexagon
 */
function drawHexGrid(con, xO = 0, yO = 0, scale = 1, width = 2, height = 2, posArr = []) {
  con.save();
  con.translate(xO, yO);
  con.scale(scale, scale);
  let hexSize = 100;
  let xD = hexSize * Math.cos(Math.PI / 6);
  let yD = hexSize * Math.sin(Math.PI / 6);

  let xstart = -width; let xend = width;
  let ystart = -height; let yend = height;
  if (posArr.length == height && posArr[0].length == width) {
    xstart = 0; xend = width - 1;
    ystart = 0; yend = height - 1;
  }

  for (let x = xstart; x <= xend; x++) {
    for (let y = ystart; y <= yend; y++) {
      let yb = height - y - 1;
      if (yb < 0 || yb >= posArr.length || x < 0 || x >= posArr[yb].length || !isNaN(posArr[yb][x])) {
        let xp = x * (2 * xD) + (Math.abs(y) % 2 ? xD : 0);
        let yp = - y * (hexSize + yD);
        con.fillStyle = 'rgba(228, 246, 238, 1)';
        con.beginPath();
        con.moveTo(xp - xD, yp - hexSize / 2);
        con.lineTo(xp - xD, yp + hexSize / 2);
        con.lineTo(xp, yp + hexSize / 2 + yD);
        con.lineTo(xp + xD, yp + hexSize / 2);
        con.lineTo(xp + xD, yp - hexSize / 2);
        con.lineTo(xp, yp - hexSize / 2 - yD);
        con.lineTo(xp - xD, yp - hexSize / 2);
        con.closePath();
        con.fill();
      }
    }
  }

  for (let x = xstart; x <= xend; x++) {
    for (let y = ystart; y <= yend; y++) {
      let yb = height - y - 1;
      if (yb < 0 || yb >= posArr.length || x < 0 || x >= posArr[yb].length || !isNaN(posArr[yb][x])) {
        let xp = x * (2 * xD) + (Math.abs(y) % 2 ? xD : 0);
        let yp = - y * (hexSize + yD);
        con.strokeStyle = 'rgba(36, 63, 65, 1)';
        con.lineWidth = 10;
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

        // con.font = Math.round(hexSize / 4) + 'px Arial';
        // con.fillStyle = 'black';
        // con.textAlign = 'center';
        // con.textBaseline = 'middle';
        // con.fillText(coordsToString(getCoords([x, y], 0)), xp, yp);
      }
    }
  }
  con.restore();
}
