"use strict";

let game = new MicroCanvas();

let gfxSpriteA, gfxSpriteB, gfxSpriteMulti;

let variable = 1142;

game.setup(function() {
  gfxSpriteA = game.loadSprite(`/* 1x1 */
    #`);
  gfxSpriteB = game.loadSprite(`/* 1x1 */
    #`);
  gfxSpriteMulti = game.loadSprite(`/* multi 2x1x2 */
    .#

    #.`);
});


game.loop(function() {

  // Clear display, redraw background text
  game.clear();

  // gfx is an Identifier
  game.drawImage(gfxSpriteA, 0,0);

  // gfx is a MemberExpression (frame access)
  game.drawImage(gfxSpriteMulti[1], 0,0);
  game.drawImage(gfxSpriteMulti[ true ? 0 : 1 ], 0,0);

  // gfx is a ConditionalExpression
  game.drawImage(true ? gfxSpriteA : gfxSpriteB, 0,0);
  game.drawImage((variable/60)%2 ? gfxSpriteA : gfxSpriteMulti[1], 0,0);

  // ClearImage is based on the same transform module
  game.clearImage((variable/60)%2 ? gfxSpriteA : gfxSpriteMulti[1], 0,0);

});


console.log("MicroCanvas initialized");
