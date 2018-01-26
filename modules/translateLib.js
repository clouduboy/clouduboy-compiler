'use strict';

const utils = require('./utils.js');

const getObject = require('./getObject.js');

const { AST } = require('./ast.js');

let translate;


// Individual translate transforms return a "transform result" object
// that needs to be further processed to generate output C++ source.
// TODO: put this onto "translate"
function transformResult(r) {
  // Strings are returned as-is
  if (typeof r == 'string'
    // Error messages will be turned into comments
   || typeof r === 'object' && r instanceof Error
  ) {
    return r
  }

  // Transform was a no-op
  // One of the transform modules could handle the expression, but
  // decided not to. This usually happens when the transform wants
  // to handle some of the deeper/underlying elements, but doesn't
  // want to deal with the current whole expression.
  // A good example of this is what happens when translating
  // AssignmentExpressions with Arrays as assignment targets.
  if (typeof r == 'object' && 'noop' in r) {
    return undefined
  }

  // Array returned, transform & join individual results into a single string
  if (typeof r == 'object' && r.length > 0) {
    return '{\n' + Array.from(r).map( result => transformResult(result) ).join(';\n') + ';\n}'
  }

  // Object returning a simple expression
  if (typeof r === 'object' && 'expression' in r) {
    return translate(r.expression)
  }

  // Object returned describing a function/library call
  if (typeof r == 'object' && 'call' in r) {
    // '<target>' string in call properties are replaced with the actual game target
    return (r.call||'').replace('<target>',translate.game.target) + translate.args(r.args)
  }

  // Array/member accessor
  if (typeof r == 'object' && 'array' in r) {
    return r.array + translate.arrs([ r.item ])
  }

  // Unknown
  if (r) return translate(translate.game.debug(`Unknown transform result: "${JSON.stringify(r)}"`))
}

// Generate mappings for available transforms
let availableTransforms = []
function collectTransforms() {
  const path = require('path'),
        fs = require('fs')

  // List transforms folder
  availableTransforms = fs.readdirSync(path.join(__dirname, 'transforms'))
    // Find all modules
    .filter(f => f.match(/\.js$/))
    // Strip file extension
    .map(f => path.basename(f, '.js'))

  return availableTransforms
}

// Translate library/framework/global method or property
// TODO: eventually translateLib should go away, and translate
// should operate on the translate transforms itself
function translateLib(exp, callexp) {
  let obj, prop, id

  // A member-style callback (obj.prop(...))
  if (exp.type == 'MemberExpression') {
    obj = AST.getString(exp.object)
    prop = AST.getString(exp.property)
  }

  // Build context object
  // TODO: review which ones are ~actually~ needed (used), and cut back on redundancy
  const context = {
    translate, // parent translate() transform function
    exp, // currently transformed expression's AST node
    callexp, // calling (parent) expression's AST node's calling

    // member access: <obj>.<prop>
    obj, // string representation of the current expression's "object" property
    prop, // string representation of this expression's "property" value

    // <id>(...)
  };

  // Ignore console methods
  if (obj === 'console') {
    translate.game.log(`Ignored console.* call: ${AST.log(exp)} */`)
    return ''
  }

  // Date and RegExp objects are unsupported
  if (obj === 'Date' || obj === 'RegExp') {
    translate.game.error(`[!] ${obj} objects are not supported: ${AST.log(exp)}`)
    return '';
  }


  // If current expression is a simple identifier, than this is a simple function call.
  // Need to look up the the binding this identifier belongs to and translate it.
  // TODO: note that there is no reason this should be in "translateLib",
  // as none of the library functions are simple identifiers.
  // This should be provided by/in translate.js, but since translateLib is
  // going away this won't be removed for now/until then.
  // TODO: this handles all CallExpression-s in translate(), including the
  // non-membership-expression ones (simple function invocations)
  // These should be handled in translate at CallExpression
  if (exp.type == 'Identifier' && callexp.type == 'CallExpression') {
    return transformResult({
      //call: lookup(exp), translate does the same for Identifiers so we can rid the lookup dependency
      call: translate(exp),
      args: callexp.arguments
    });
  }
  // TODO: This is now potentially absolutely useless and unneeded

  // Automatic detection of transforms (load all modules) and leave it to the
  // transform modules themselves to figure it out whether or not they can transform
  // the passed node.
  // Transform modules should return "undefined" when they cannot transform the passed
  // node, in which case an another transform will be tried.
  // Try to transform the current node:
  for (let tf of availableTransforms) {
    let tfr = require('./transforms/'+tf)(context)

    if (tfr !== undefined) return transformResult(tfr)
  }
  // TODO: In the future it might be worthwile to build a dispatcher that extracts this
  // info from the modules on load time and speeds up the process but this should
  // only be a performance improvement when several modules hog the speed of the
  // translation process.

  // Unknown
  return translate(translate.game.error(`[!] Unsupported: ${AST.log(exp)}`))
}



module.exports = function(callback) {
  translate = callback;

  // Initialize list of available transforms
  collectTransforms();

  return translateLib;
};
