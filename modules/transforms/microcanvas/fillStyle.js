// game.fillStyle = "white";   >>>   _microcanvas_fill_color = WHITE;

/**
@validhtml5
(`string`) Set the current fill style.

Valid HTML5 but we are only using it for color.

Used for `@drawText()`/`@centerText` text fill (e.g. draw/clear).

Useful for when we add color support (e.g. for the Tiny Arcade).
*/

const { AST } = require('../../ast')


module.exports = (context) => {
  const {translate, exp} = context;
  const deepObj = context.exp.left.object;

  // Minimal processing on the right hand side
  let rhs = AST.getString(exp.right);

  if (rhs === 'white' || rhs === 'black') rhs = rhs.toUpperCase()
  // TODO: color device support

  return '_microcanvas_fill_color = '+rhs
}
