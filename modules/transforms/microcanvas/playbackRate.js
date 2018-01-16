// game.playbackRate = 0.5   >>>   <target>.setFrameRate(round(60*0.5))

/**
@experimental
(`number`) Set playback rate (game framerate)

Allows for slowing down (and, optionally, speeding up, as long as the
hardware can take the extra load) of the game. Useful for development
(e.g. testing) and for the same reasons as stated at the `@frameRate`
transform.

[!] Note
This feature is currently highly experimental and (especially when compiled
for a target) pretty much unsupported, YMMV.
*/

module.exports = (context) => {
  const { translate, callexp } = context

  // Build the setFrameRate() call's parameter list
  // We use the AST here so we can pass the whole thing to translate(),
  // which will take care of any expressions and variables/computed values
  // TODO: refactor using ast.js
  // TODO: consider only allowing static numeric literals and pre-computing
  // their framerate value on conversion (skipping the whole round(60*x)-dance)
  const framerateArgs = [ {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'round' }
    },
    arguments: [ {
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Literal', value: 60, raw: '60' },

        // callexp is the parent expression which is an AssignmentExpression
        // here - we use the RHS of this expression and put it into the
        // setFrameRate function call
        right: callexp.right
    } ]
  } ]

  return { call: '<target>.setFrameRate', args: translateframerateArgs }
}
