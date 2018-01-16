// game.detectCollision(gfxSprite1, x1, y1, gfxSprite2, x2, y2[, true]);
// >>>
// <target>.detectCollision(gfx_sprite1, x1, y1, GFX_SPRITE1_WIDTH, GFX_SPRITE1_HEIGHT, gfx_sprite2, x2, y2, GFX_SPRITE2_WIDTH, GFX_SPRITE2_HEIGHT[, true]);

/**
(`boolean`) Check for collisions.

Checks for collisions (overlap) of two sprites drawn in specific reference
to each other.

The `precise` optional argument toggles pixel-for-pixel checking, while
without it, only the bounding rectangles of the sprites are checked for
overlap.
Currently `precise` collisions in target native compiles are unimplemented,
but are considered and on the roadmap.

Note that collision support is not enabled until you use the
`@detectCollision()` method, or any of the collision detection functions.
This means that the implementation of these methods are only added to
the target native output if you use the functions themselves - if
you decide to implement your own collision detection you don't have
to worry about these functions taking up valuable program space.
*/

const { AST } = require('../../ast')


module.exports = (context) => {
  const {translate, callexp} = context;

  // Enables the collision-checking support in the target compile.
  translate.game.collisions = true;

  // Optional "precise" argument
  let precise = false
  if (callexp.arguments[6]) {
    // TODO: this will only work for literals
    precise = JSON.parse(callexp.arguments[6].value) ? true : false
  }
  // TODO: Implement and set default to "true"

  // Sprites 1 & 2
  const secondSprite = 3
  let s1 = callexp.arguments[0]
  let s2 = callexp.arguments[secondSprite]

  // TODO: the library function should be named more uniquely to avoid
  // conflicts with existing code
  return 'collides'+translate.args([
    callexp.arguments[0],
    callexp.arguments[1],
    callexp.arguments[2],
    AST.MemberExpression(s1, AST.Identifier('width')),
    AST.MemberExpression(s1, AST.Identifier('height')),

    callexp.arguments[secondSprite+0],
    callexp.arguments[secondSprite+1],
    callexp.arguments[secondSprite+2],
    AST.MemberExpression(s2, AST.Identifier('width')),
    AST.MemberExpression(s2, AST.Identifier('height')),

    AST.Literal( precise ? 'true' : 'false' )
  ])
}
