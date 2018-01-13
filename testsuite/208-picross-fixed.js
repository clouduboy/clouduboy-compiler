"use strict";

let game = new MicroCanvas();

let fieldSize = 8;
let spriteSize = 5;

function generate(infoArr) {
  let arr = [0, 0, 0, 0, 0, 0, 0, 0];
  let block = 0;
  let blockNum = 3;
  for (let i = 0; i < fieldSize; i++) {
    arr[i] = game.random(0, 1);
    if (arr[i] == 1) {
      block = block + 1;
    }
    else if (block > 0) {
      infoArr[blockNum] = block;
      blockNum = blockNum - 1;
      block = 0;
    }
  }
  infoArr[blockNum] = block;
  return arr;
};

function calcColumn(x) {
  let infoArr = [0, 0, 0, 0];
  let block = 0;
  let blockNum = 3;
  if (board0[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board1[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board2[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board3[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board4[x] == 1) {
      block = block + 1;generate
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board5[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board6[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  if (board7[x] == 1) {
      block = block + 1;
  }
  else if (block > 0) {
    infoArr[blockNum] = block;
    blockNum = blockNum - 1;
    block = 0;
  }
  infoArr[blockNum] = block;
  return infoArr;
}

function mark(arr, x) {
  if (arr[x] == 0) {
    arr[x] = 1;
  } else {
    arr[x] = 0;
  }
};

function markRow(x, y) {
  if (y == 0) {
    mark(current0, x);
  }
  else if (y == 1) {
    mark(current1, x);
  }
  else if (y == 2) {
    mark(current2, x);
  }
  else if (y == 3) {
    mark(current3, x);
  }
  else if (y == 4) {
    mark(current4, x);
  }
  else if (y == 5) {
    mark(current5, x);
  }
  else if (y == 6) {
    mark(current6, x);
  }
  else if (y == 7) {
    mark(current7, x);
  }
};

let gfxWin;
let gfxField;
let gfxNumbers;
let rowInfo0 = [0, 0, 0, 0];
let rowInfo1 = [0, 0, 0, 0];
let rowInfo2 = [0, 0, 0, 0];
let rowInfo3 = [0, 0, 0, 0];
let rowInfo4 = [0, 0, 0, 0];
let rowInfo5 = [0, 0, 0, 0];
let rowInfo6 = [0, 0, 0, 0];
let rowInfo7 = [0, 0, 0, 0];
let board0 = [0];
let board1 = [0];
let board2 = [0];
let board3 = [0];
let board4 = [0];
let board5 = [0];
let board6 = [0];
let board7 = [0];
board0 = generate(rowInfo0);
board1 = generate(rowInfo1);
board2 = generate(rowInfo2);
board3 = generate(rowInfo3);
board4 = generate(rowInfo4);
board5 = generate(rowInfo5);
board6 = generate(rowInfo6);
board7 = generate(rowInfo7);
let columnInfo0 = [0];
let columnInfo1 = [0];
let columnInfo2 = [0];
let columnInfo3 = [0];
let columnInfo4 = [0];
let columnInfo5 = [0];
let columnInfo6 = [0];
let columnInfo7 = [0];
columnInfo0 = calcColumn(0);
columnInfo1 = calcColumn(1);
columnInfo2 = calcColumn(2);
columnInfo3 = calcColumn(3);
columnInfo4 = calcColumn(4);
columnInfo5 = calcColumn(5);
columnInfo6 = calcColumn(6);
columnInfo7 = calcColumn(7);
let current0 = [0, 0, 0, 0, 0, 0, 0, 0];
let current1 = [0, 0, 0, 0, 0, 0, 0, 0];
let current2 = [0, 0, 0, 0, 0, 0, 0, 0];
let current3 = [0, 0, 0, 0, 0, 0, 0, 0];
let current4 = [0, 0, 0, 0, 0, 0, 0, 0];
let current5 = [0, 0, 0, 0, 0, 0, 0, 0];
let current6 = [0, 0, 0, 0, 0, 0, 0, 0];
let current7 = [0, 0, 0, 0, 0, 0, 0, 0];

let gameActive = true;
let cursorPosX = 0, cursorPosY = 0;
let fieldPxSize = fieldSize * spriteSize;
let displayWidth = 128, displayHeight = 64;
let fieldStartX = displayWidth-fieldPxSize-1, fieldStartY = displayHeight-fieldPxSize-1;


function checkRow(board, current) {
  for (let i = 0; i < fieldSize; i++) {
   	 if (board[i] != current[i]) {
       return 0;
     }
  }
  return 1;
}

function checkBoard() {
  return (checkRow(board0, current0) + checkRow(board1, current1) + checkRow(board2, current2) + checkRow(board3, current3) + checkRow(board4, current4) + checkRow(board5, current5) + checkRow(board6, current6) + checkRow(board7, current7)) == 8;
}


game.setup(function(game) {
  gfxWin = game.loadSprite(`! win 20x5
....................
.#..#...#...#.#.#..#
.#..#...#...#.#.##.#
.#..#...#.#.#.#.#.##
..##....#####.#.#..#`);
  gfxField = game.loadSprite(`! field 5x5x4
#####
#....
#....
#....
#....

#####
#....
#.##.
#.##.
#....

#####
##..#
#....
#....
##..#

#####
##..#
#.##.
#.##.
##..#`);
  gfxNumbers = game.loadSprite(`! num 5x5x9
.....
.....
.....
.....
.....

.....
..#..
..#..
..#..
..#..

.....
.###.
...#.
.#...
.###.

.....
.###.
...#.
..##.
.###.

.....
.#...
.#.#.
.###.
...#.

.....
.###.
.#...
...#.
.###.

.....
.#...
.#...
.###.
.###.

.....
.###.
...#.
...#.
...#.

.....
.###.
.#.#.
.###.
.###.`);
});


function drawRow(game, y, arr, infoArr) {
  for (let x = 0; x < fieldSize; x++) {
    let type = arr[x];
    if (x == cursorPosX && y == cursorPosY) {
      type = type + 2;
    }
    for (let i = 0; i < 4; i++) {
      game.drawImage(gfxNumbers[infoArr[i]], fieldStartX-5-(i*spriteSize), fieldStartY+(y*spriteSize));
    }
    game.drawImage(gfxField[type], fieldStartX+(x*spriteSize), fieldStartY+(y*spriteSize));
  }
}


game.loop(function() {

  // Clear display, redraw background text
  game.clear();

  if (gameActive && game.everyXFrames(8)) {
    if (checkBoard()) {
      gameActive = false
      game.drawImage(gfxWin[0], 0, 0);
  	}
    else if (game.buttonPressed('right')) {
      cursorPosX = Math.min(cursorPosX + 1, 7);
    }
    else if (game.buttonPressed('left')) {
      cursorPosX = Math.max(cursorPosX - 1, 0);
    }
    else if (game.buttonPressed('down')) {
      cursorPosY = Math.min(cursorPosY + 1, 7);
    }
    else if (game.buttonPressed('up')) {
      cursorPosY = Math.max(cursorPosY - 1, 0);
    }
	else if (game.buttonPressed('space')) {
      markRow(cursorPosX, cursorPosY);
    }
  }

  for (let i = 0; i < 4; i++) {
    game.drawImage(gfxNumbers[columnInfo0[i]], fieldStartX+(0*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo1[i]], fieldStartX+(1*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo2[i]], fieldStartX+(2*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo3[i]], fieldStartX+(3*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo4[i]], fieldStartX+(4*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo5[i]], fieldStartX+(5*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo6[i]], fieldStartX+(6*spriteSize), fieldStartY-6-(i*spriteSize));
    game.drawImage(gfxNumbers[columnInfo7[i]], fieldStartX+(7*spriteSize), fieldStartY-6-(i*spriteSize));
  }

  // Draw Field
  drawRow(game, 0, current0, rowInfo0);
  drawRow(game, 1, current1, rowInfo1);
  drawRow(game, 2, current2, rowInfo2);
  drawRow(game, 3, current3, rowInfo3);
  drawRow(game, 4, current4, rowInfo4);
  drawRow(game, 5, current5, rowInfo5);
  drawRow(game, 6, current6, rowInfo6);
  drawRow(game, 7, current7, rowInfo7);

  game.fillRect(fieldStartX+fieldPxSize, fieldStartY, fieldStartX+fieldPxSize, displayHeight);
  game.fillRect(fieldStartX, fieldStartY+fieldPxSize, fieldStartX+fieldPxSize, fieldStartY+fieldPxSize);



});

console.log("Thomas' first Clouduboy game!");
