'use strict'

/**
Transform module for `Math.*`

Transforms the built-in Math library's methods that are
used rather frequently in games to their C counterparts.
*/

const { AST } = require('../ast')


module.exports = function(context) {
  // Expand passed-in context object
  const { translate, exp, obj, prop, callexp } = context

  // Authority check: bail early if cannot translate the node
  if (!(
    obj === 'Math' // Math library property/call
  )) return undefined


  // Simple one-on-one mappings
  switch (prop) {
    // Math.round( <float> )
    case 'round':
      return { call: 'round', args: callexp.arguments }

    // Math.floor( <float> )
    case 'floor':
      // A cast to int is required to use value in expressions like '%'
      // TODO: only use cast when it's needed or requested ( check the
      // surroundings of the expression)
      return { call: '(int)floor', args: callexp.arguments }

    // Math.abs( <number> )
    case 'abs':
      return { call: 'abs', args: callexp.arguments }

    // Math.random()
    // TODO: review proper syntax
    case 'random':
      return { call: 'random', args: callexp.arguments }

    // Math.min( <number1>[, <number2>] )
    // Math.max( <number1>[, <number2>] )
    case 'min':
    case 'max':
      // Both of these are generally implemented as macros, and will fail
      // when there are less than two arguments. In those cases we just return
      // the first argument with no min/max calls at all.
      if (callexp.arguments.length < 2) {
        return { expression: callexp.arguments[0] }
      }

      // TODO: Warn that maximum two arguments are allowed
      return { call: prop, args: callexp.arguments.slice(0,2) }
  }


  // This transform module could not transform this AST node
  return undefined;
}
