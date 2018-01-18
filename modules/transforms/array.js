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
  if (exp.type === 'MemberExpression' && exp.computed) {
    // Lookup result
    const lres = translate.lookup(exp.object, true)

    // Defined on the global scope
    // (Note: although technically assets, like gfx* are "variables defined
    // on the global scope", they have a different type when looked up)
    if (lres.type === 'GlobalVariable') {
      // Fetch global variable descriptor
      const glob = lres.descriptor

      // TODO: array initializer syntax on global declarations currently
      // doesn't generate a typeInfo property
      if (glob.typeInfo && glob.typeInfo.array) {
        return { array: lres.translated, item: exp.property }
      } else return translate.game.error(`Variable "${AST.log(exp)}" defined on the global scope is not an Array.`)

    // Local array (e.g. passed in as a function parameter)
    // TODO: when we transitively track type information for passed
    // function parameters, these two branches could be merged together
    } else if (lres.type === 'ScopedVariable') {
      // TODO: array-ness check (currently no transitive type info)

      // Translate as array access
      return { array: lres.translated, item: exp.property }
    }
  }

  // Assignment to array item
  if (exp.type === 'AssignmentExpression'
   && exp.left.type === 'MemberExpression'
   && exp.left.computed
  ) {
    // It is indeed an array item value assignment, but we will handle it
    // when we come we return to the MemberExpression (because otherwise
    // we would need to take care of the right-hand-side, too - but usually
    // we don't care about that with Arrays)
    const deepObj = AST.getString(exp.left.object)
    const lres = translate.lookup(exp.left.object, true)

    // TODO: array-ness checks
    if (lres.type === 'ScopedVariable' || lres.type === 'GlobalVariable') {
      return { noop: true }
    }
  }

  // This transform module could not transform this AST node
  return undefined;
}
