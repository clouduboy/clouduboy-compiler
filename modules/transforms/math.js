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
    // Math.round
    case 'round':
      return { call: 'round', args: callexp.arguments }

    // Math.floor
    case 'floor':
      return { call: 'floor', args: callexp.arguments }

    // Math.abs
    case 'abs':
      return { call: 'abs', args: callexp.arguments }

    // Math.random
    // TODO: review proper syntax
    case 'random':
      return { call: 'random', args: callexp.arguments }

    // TODO: Math.min
    // TODO: Math.max
  }


  // This transform module could not transform this AST node
  return undefined;
}
