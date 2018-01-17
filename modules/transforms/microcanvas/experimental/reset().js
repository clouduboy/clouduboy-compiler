// game.reset();   >>>   <target>.reset();

/**
(`void`) Re-initializes the game.

Resets the game (practically, re-initializes any global state, like
frame counters etc. and then re-runs `@setup()`).

For all intents and purposes, for a well-written game (that sets up
its intial state in the `@setup()` method) this will effectively reset
(restart) the game. In some occasions it might be useful to keep *some*
game state over resets, though - such as not showing the intro screen
again or keeping configuration (like sound On/Off) previously set.
*/


module.exports = (context) => {
  const {translate, callexp} = context

  // simple global function mapping
  return ({
    call: 'setup',
    args: callexp.arguments
  })
}
