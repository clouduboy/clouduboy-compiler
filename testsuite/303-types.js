"use strict";

let game = new MicroCanvas();

let arr1 = [ 1, 2, 3, 4, 5];
let arr2 = new Array(10);

//let func1 = () => {};
let func1 = function(z) {
}
let func2 = function(arr, i) {
  return arr[i]
}


game.setup(function() {
  func2(arr1, 0);
});


game.loop(function() {
});

console.log("MicroCanvas initialized");
