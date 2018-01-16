'use strict'

/**
Transform module for `Array.*`

Transforms the built-in Array methods and the length property

TODO: Recount Array limitations
*/

// The group of transforms this transform module describes
const transformFamily = require('path').basename(__filename, '.js')

const collectTransforms = require('../collectTransforms.js')
let availableTransforms


const { AST } = require('../ast')


module.exports = function(context) {
  // Expand passed-in context object
  const { translate, exp, obj, prop, callexp } = context

  // Authority check: bail early if cannot translate the node
  // TODO: Check for prop's identifier's assigned type (we may
  // need to inline Flow's inferred types for this to work
  // properly). If it's not an array bail, or issue a
  // compiler warning
  if (false) return undefined


  // Make sure we have a list of available transforms
  if (!availableTransforms) availableTransforms=collectTransforms(`${__dirname}/${transformFamily}`)

  // Transform result
  let tfr

  // Check if we have a method transform for this object
  if (availableTransforms.has(prop+'()')) {
    tfr = require(`./${transformFamily}/${prop}()`)(context)
  }

  // Check if we have a property transform for this object
  if (availableTransforms.has(prop)) {
    tfr = require(`./${transformFamily}/${prop}`)(context)
  }

  // Make sure the transform could handle the node
  if (tfr !== undefined) return tfr


  // Array item access
  if (exp.type === 'MemberExpression' && exp.computed && obj in translate.game.globals) {
    // If this is an assignment expression

    // Fetch global variable descriptor
    const glob = translate.game.globals[obj];

    // TODO: array initializer syntax on global declarations currently
    // doesn't generate a typeInfo property
    if (glob.typeInfo && glob.typeInfo.array) {
      return { array: obj, item: exp.property }
    } else return `__arrayAccess("${AST.getString(exp)}")`
  }

  // Assignment to array item
  if (exp.type === 'AssignmentExpression' && exp.left.type === 'MemberExpression') {
    // It is indeed an array item value assignment, but we will handle it
    // when we come we return to the MemberExpression (because otherwise
    // we would need to take care of the right-hand-side, too - but usually
    // we don't care about that with Arrays)
    if (exp.left.computed && AST.getString(exp.left.object) in translate.game.globals) {
      return { noop: true }
    }
  }

  // This transform module could not transform this AST node
  return undefined;
}
