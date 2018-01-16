'use strict';

const utils = require('./utils.js');

const getObject = require('./getObject.js');

const { AST } = require('./ast.js');

let translate;


// Individual translate transforms return a "transform result" object
// that needs to be further processed to generate output C++ source.
// TODO: put this onto "translate"
function transformResult(r) {
  // String returned, use as-is
  if (typeof r == 'string') {
    return r;
  }

  // Array returned, transform & join individual results into a single string
  if (typeof r == 'object' && r.length > 0) {
    return '{\n' + Array.from(r).map( result => transformResult(result) ).join(';\n') + ';\n}'
  }

  // Object returned describing a function/library call
  if (typeof r == 'object' && 'call' in r) {
    // '<target>' string in call properties are replaced with the actual game target
    return r.call.replace('<target>',translate.game.target) + translate.args(r.args)
  }
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

  // If current expression is a simple identifier, than this is a simple function call.
  // Need to look up the the binding this identifier belongs to and translate it.
  // TODO: note that there is no reason this should be in "translateLib",
  // as none of the library functions are simple identifiers.
  // This should be provided by/in translate.js, but since translateLib is
  // going away this won't be removed for now/until then.
  if (exp.type == 'Identifier') {
    return transformResult({
      //call: lookup(exp), translate does the same for Identifiers so we can rid the lookup dependency
      call: translate(exp),
      args: callexp.arguments
    });
  }

  // Standard maths calls cross-compilation
  if (obj === 'Math') {
    let tfr = require('./translate/math')(context)
    if (tfr) return transformResult(tfr)
  }

  // MicroCanvas library method/property or object (e.g. Sprite, Sound objects etc.)
  let tfr = require('./translate/microcanvas')(context)
  if (tfr) return transformResult(tfr)

  // TODO: do automatic detection of transforms (load all modules) and leave it to the
  // transform modules themselves to figure it out whether or not they can transform
  // the passed node.
  // Transform modules should return "undefined" when they cannot transform the passed
  // node, in which case an another transform will be tried.
  // In the future it might be worthwile to build a dispatcher that extracts this
  // info from the modules on load time and speeds up the process but this should
  // only be a performance improvement when several modules hog the speed of the
  // translation process.

  // Unknown
  return '__translateLib("'+(callexp&&callexp.$raw||AST.getString(exp))+'")';
}



module.exports = function(callback) {
  translate = callback;
  return translateLib;
};
