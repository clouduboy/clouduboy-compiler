// game.drawText("Sprite\nDemo", 0,0, 3);
// >>>
// <target>.setTextSize(3);
// <target>.setCursor(0,0);
// <target>.print("Sprite\nDemo");

/**
(`void`) Draws the specified text onto the screen.

Similar to fillText, but with an extra parameter for text size.

*/

const { AST } = require('../../ast')

// Draws strings onto the screen using the built-in default font
module.exports = (context) => {
  const {translate, callexp} = context
  const sA = callexp.arguments

  // TODO: proper string/concat/cast/etc expression handling
  // TODO: template string handling
  const text = AST.getString(sA[0])

  // TODO: Re-use fillText instead
  return [
    { call: '<target>.setTextSize', args: [ sA[3] ? sA[3] : AST.Literal(1) ] },
    { call: '<target>.setCursor', args: [ sA[1], sA[2] ] },
    { call: '<target>.print', args: [ sA[0] ] }
  ]
}
