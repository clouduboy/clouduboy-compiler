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

  // Check for legacy parameter order
  if (sA[2].type === 'TemplateLiteral' // 3rd parameter is a template literal..
    || sA[2].type === 'Literal' && typeof sA[2].value == 'string' // ..or string literal
  ) {
    translate.game.warn(`[*] Deprecation Notice: the legacy fillText(x,y,text) parameter order is deprecated, please use (text,x,y) instead: ${AST.log(callexp)}`)
    text = sA[2]
    x = sA[0]
    y = sA[1]
  } else {
    text = sA[0]
    x = sA[1]
    y = sA[2]
  }

  // TODO: proper string/concat/cast/etc expression handling
  // No String/Template literal passed as text parameter, expressions
  // are currently not supported

  if (text.type !== 'TemplateLiteral' && text.type !== 'Literal') {
    return translate.game.error(`[!] Unfortunately text drawing functions only support strings & template literals: ${AST.log(callexp)}`)
  }
  // Check for non-string literals as text parameter
  if (text.type === 'Literal' && typeof text.value != 'string') {
    translate.game.log(`Provided "${typeof text.value}" literal automatically converted to string: ${AST.log(callexp)}`)
    text.value = String(text.value)
  }

  // Check if our print message has any embedded expressions,
  // and evaluate them/print them into a string and then onto
  // the display.
  // TODO: figure out a way to generalize template strings handling
  let printStage
  if (text.type === 'TemplateLiteral' && text.expressions.length > 0) {
    let tl = text;
    text = AST.Identifier('_microcanvas_textbuffer')

    printStage = [
      { call: 'sprintf',
        args: [
          text,
          // TODO: %u means unsigned, handle signed values (%d/%i)
          AST.Literal(tl.quasis[0].value.raw +'%u'+ tl.quasis[1].value.raw),
          ...tl.expressions
        ]
      },
      { call: '<target>.print',
        args: [ text ]
      }
    ]
    // TODO: handle arbitrary expressions for template literals

  // Just print whatever is in text
  } else {
    printStage = [ { call: '<target>.print', args: [ text ] } ]
  }

  return [
    { call: '<target>.setTextSize', args: [ sA[3] ? sA[3] : AST.Literal(1) ] },
    { call: '<target>.setCursor', args: [ x, y ] },
    ...printStage
  ]
}
