// game.buttonPressed('space');   >>>    <target>.buttonPressed(BUTTON_A);

/**
(`boolean`) Check for button presses.

The method returns a boolean `true` if the passed key/button is
currently being held down.
*/

const { AST } = require('../../ast')



// Clear the screen
// Equivalent of game.clearRect(0, 0, game.width, game.height)
module.exports = (context) => {
  const {translate, callexp} = context
  const BUTTONS = translate.game.targetPlatform.mappings.buttons

  // Figure out which button is being queried
  const btn = AST.getString(callexp.arguments[0])

  // Make sure button actually exists
  if (btn in BUTTONS === false) {
    return translate.game.error(`[!] Unknown button "${btn}" in: ${AST.log(callexp)}`)
  }

  // simple 1:1 mapping
  return ({
    call: '<target>.pressed',
    args: [ BUTTONS[btn] ]
  })
}
