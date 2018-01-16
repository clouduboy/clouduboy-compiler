// game.fillText("Sprite\nDemo", 0,0);
// >>>
// <target>.setTextSize(3);
// <target>.setCursor(0,0);
// <target>.print("Sprite\nDemo");

/**
@validhtml5
(`void`) Draws the specified text onto the screen.

[!] Note
Although technically this method is valid HTML5 (and is present on the
Canvas object) MicroCanvas overrides the built-in method with a custom
implementation. This is needed for multiple reasons, the canvas version
is much less consistent (due to the fact that it uses fonts), and is
generally unsuitable for tiny density screens like the ones used in
MicroCanvas.

`fillText()` uses a 5x7px monospaced pixelgraphic font to display ASCII
characters. This "font" is not modifiable currently, but loading/using
custom pixel fonts in MicroCanvas is entirely possible and is a planned
feature for the future.

TODO: template strings in fillText
*/

const { AST } = require('../../ast')


// Draws strings onto the screen using the built-in default font
module.exports = (context) => {
  const {translate, callexp} = context
  const sA = callexp.arguments

  // Handle both parameter orders (text, x,y) & (x,y, text)
  let text, x,y;

  // TODO: check for string literals as well
  if (sA[2].type === 'TemplateLiteral') {
    text = sA[2]
    x = sA[0]
    y = sA[1]
  } else {
    text = sA[0]
    x = sA[1]
    y = sA[2]
  }

  // TODO: proper string/concat/cast/etc expression handling
  // TODO: template string handling

  return [
    { call: '<target>.setTextSize', args: [ sA[3] ? sA[3] : AST.Literal(1) ] },
    { call: '<target>.setCursor', args: [ x, y ] },
    { call: '<target>.print', args: [ text ] }
  ]
}
