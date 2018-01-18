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

  // An early return in loop() needs target.display() to show screen contents
  if (false) return;

  // Non-existent button reference, also Empty Expression
  if (game.buttonPressed('NoSuchButton!')) ;

  // No such MicroCanvas method
  game.notAValidMethod();

  // Assignment to non-existent MicroCanvas property
  game.notReallyAThing = 42;

  // Unsupported drawImage parameters
  // TODO: wow this outputs some ~really~ funky recursive log messages
  game.drawImage(returnSprite(2));

  // Forgot to load sprite in setup()
  game.drawImage(gfxSprite2, 0,0);


  // Old deprecated parameter order (warning)
  game.fillText(WIDTH/3, 10, "BOO!");

  // Although ambiguous this will work, prints 22 and a notice about an automatic conversion to string a literal
  game.fillText(22, 32, 42)
  // This is actually an error, as 3rd param (legacy) is not a string or template literal (falls back to first param, which is an expression, so throws an error)
  game.fillText(WIDTH/2,HEIGHT/2, 42)
  // This on the other hand will work as intended (with a notice)
  game.fillText(42, WIDTH/2,HEIGHT/2)
});

function returnSprite(spriteNumber) {
  return spriteNumber > 1 ? gfxSprite2 : gfxSprite1;
}

console.log("MicroCanvas initialized");
