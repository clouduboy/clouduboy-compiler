// game.buttonPressed('space');   >>>    <target>.buttonPressed(BUTTON_A);

/**
(`boolean`) Check for button presses.

The method returns a boolean `true` if the passed key/button is
currently being held down.
*/

const { AST } = require('../../ast')

// Required for the button mappings
// TODO: these button mappings should probably be defined in and
// loaded into translate.game.targetButtonMapping or something
const utils = require(`../../utils`);


// Clear the screen
// Equivalent of game.clearRect(0, 0, game.width, game.height)
module.exports = (context) => {
  const {translate, callexp} = context;

  // Figure out which button is being queried
  const btn = AST.getString(callexp.arguments[0]);

  // Make sure button actually exists
  if (!btn in utils.BUTTONS[translate.game.target]) {
    return translate.game.error(`/* [!] Unknown button "${btn}" in: ${AST.getString(exp)} */`)
  }

  // simple 1:1 mapping
  return ({
    call: '<target>.pressed',
    args: [ utils.BUTTONS[translate.game.target][btn] ]
  })
}
