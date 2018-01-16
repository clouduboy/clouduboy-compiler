// game.drawText("Sprite\nDemo", 0,0, 3);
// >>>
// arduboy.setTextSize(3);
// arduboy.setCursor(0,0);
// arduboy.print("Sprite\nDemo");

/**
@validhtml5
(`void`) Draws the specified text onto the screen

[!] Note
Although technically this method is valid HTML5 (and is present on the
Canvas object) MicroCanvas overrides the built-in method with a custom
implementation. This is needed for multiple reasons, the canvas version
is much less consistent (due to the fact that it uses fonts), and is
generally unsuitable for tiny density screens like the ones used in
MicroCanvas.

drawText uses a 5x7px monospaced pixelgraphic font to display ASCII
characters. This "font" is not modifiable currently, but loading/using
custom pixel fonts in MicroCanvas is entirely possible and is a planned
feature for the future.

TODO: template strings in drawText
*/

const utils = require(`../../utils`)

const { AST } = require('../../ast')

// Draws strings onto the screen using the built-in default font
module.exports = (context) => {
  const {translate, callexp} = context
  const sA = callexp.arguments

  // TODO: proper string/concat/cast/etc expression handling
  // TODO: template string handling
  const text = AST.getString(sA[0])

  return [
    { call: '<target>.setTextSize', args: [ sA[3] ? sA[3] : AST.Literal(1) ] },
    { call: '<target>.setCursor', args: [ sA[1], sA[2] ] },
    { call: '<target>.print', args: [ sA[0] ] }
  ]
  // todo subframe slice version
}
