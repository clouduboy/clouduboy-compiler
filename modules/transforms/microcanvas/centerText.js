// game.centerText("Sprite\nDemo", game.width/2,0);
// >>>
// arduboy.setTextSize(3);
// arduboy.setCursor(game.width/2-"Sprite\nDemo".length()*6/2,0);
// arduboy.print("Sprite\nDemo");

/**
(`void`) Draws the specified text centered on the X axis onto the screen.

Will probably need custom implementation ()
*/

const { AST } = require('../../ast')

const alias = require(`./fillText()`)


module.exports = (context) => {
  const {translate, callexp} = context

  // Generate initial transform via fillText()
  const r = alias(context)

  const text = r.filter(exp => exp.call === '<target>.print').pop().args[0]
  const pos =  r.filter(exp => exp.call === '<target>.setCursor').pop()

  // TODO: manipulate filltext's setCursor
  pos.args[0] = AST.BinaryExpression(
    '-',
    pos.args[0], // x coordinate
    JSON.stringify(AST.getString(text))+'.length() * 6 / 2'
  )

  return r
}
