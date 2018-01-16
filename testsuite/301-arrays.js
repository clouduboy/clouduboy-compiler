"use strict";

let game = new MicroCanvas();

let arr1 = [ 1, 2, 3, 4, 5];
let arr2 = new Array(10);

game.setup(function() {

});

game.loop(function() {
  arr1.fill(0);
  arr2.fill(1+2);

  arr1[1] = 10;
  let val = arr2[1 + 5];

  let fromarr = arr1[val-1];

  arr2[0] = testFunction(arr1[1]);
});

function testFunction(value) {
  return value*2;
}

console.log("MicroCanvas initialized");
