"use strict";

let game = new MicroCanvas();

let arr1 = [ 1, 2, 3, 4, 5];
let arr2 = new Array(10);

let gfxSprite1, gfxSprite2;

game.setup(function() {

});

// TODO: handle all current error/warning cases
// TODO: handle all LIMITATIONS.md cases
game.loop(function() {
  // Objects are not supported
  let loopObj = { foo: "bar" };

  // Built-in objects aren't supported either
  let myDate = new Date();

  // Other global object usecases
  let now = Date.now();

  // Arrays can only be defined on the global scope
  let loopArr = [ 1, 2, 3 ];

  // Non-existent button reference
  if (game.buttonPressed('NoSuchButton!')) ;

  // No such MicroCanvas method
  game.notAValidMethod();

  // Assignment to non-existent MicroCanvas property
  game.notReallyAThing = 42;

  // Unsupported drawImage parameters
  game.drawImage(returnSprite(2));

  // Forgot to load sprite in setup()
  game.drawImage(gfxSprite2, 0,0);
});

function returnSprite(spriteNumber) {
  return spriteNumber > 1 ? gfxSprite2 : gfxSprite1;
}

console.log("MicroCanvas initialized");
