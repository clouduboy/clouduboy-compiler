'use strict'

// Acorn (JS parser)
const acorn = require('acorn')

// The acorn Node constructor
const Node = acorn.parse('function x() {}').body[0].constructor


// AST helpers for node creation
const AST = Object.create(null)

AST.Identifier = function(name) {
  return { type: 'Identifier', name: name }
}

AST.Literal = function(value) {
  let raw = JSON.stringify(value)
  if (typeof value !== 'string') raw = `"${raw}"`

  return { type: 'Literal', value: value, raw: raw }
}

AST.MemberExpression = function(object, property) {
  return {
    type: 'MemberExpression',
    object, property
  }
}

AST.ConditionalExpression = function(test, consequent, alternate) {
  return {
    type: 'ConditionalExpression',
    test, consequent, alternate
  }
}

AST.CallExpression = function(callee, args) {
  return {
    type: 'CallExpression',
    callee, arguments: args
  }
}

AST.BinaryExpression = function(operator, left, right) {
  return {
    type: 'BinaryExpression',
    operator, left, right
  }
}


// Sometimes with embedded member expressions (e.g. object[member].prop) we need
// to check the deep(est) object of the member expression, this is a helper that
// does that.
// memberExpDeepObjectId on the above object would return "object"
AST.getMemberExpressionDeepObjectId = function(exp) {
  // Expression not an object/AST node
  if (typeof exp != 'object') return undefined

  // Not an (embedded) expression
  if (
    exp.type != 'MemberExpression'
    || typeof exp.object != 'object'
    || exp.object.type != 'MemberExpression'
  ) return undefined

  // Return the embedded MemberExpression's object's "name"
  // (assuming it's an Identifier)
  return exp.object.object.name
  // TODO: make this work for arbitrary depths (e.g. return o for o[x].a.b.c),
  // this is currently not required anywhere by MicroCanvas, though.
}


// Occasionally we need to find (or find out) an ancestor among the list of
// element parent
AST.findAncestor = function(node, filterFunction) {
  // Path to the node (if found)
  const path = []

  // Walk ancestor tree
  let p
  while (p = node.$parent) {
    path.push(p)

    // Try to find a match with the requested element
    if (filterFunction(p)) return path

    // Check parent's parent
    node = p
  }

  // No ancestor node was found that satisfied the filterFunction
  return false;
}


// Original (source) string representation of the AST node
AST.getString = require('./getString')


module.exports = { from, AST }



// Generate AST from JavaScript source
function from(source) {
  // Parse AST
  // TODO: consider using Flow for AST generation?
  let ast = acorn.parse(source, { ecmaVersion: 6, sourceType: 'script' })

  // Source
  Object.defineProperty(ast, '$source', { value: source })

  // Preprocess AST - add node parents
  ast.body.forEach(n => {
    // Top level nodes
    if (n instanceof Node) addParent(ast, n, null)
  })

  return ast
}

function addParent(ast, n, parent) {
  if (!(n && typeof n == 'object')) {
    return
  }

  // Collections
  if (n.length) {
    return n.forEach(node => addParent(ast, node, parent))
  }

  // Nodes
  if (n instanceof Node) {
    Object.defineProperty(n, '$parent', { value: parent })
  }

  // Raw content
  if ('start' in n && 'end' in n) {
    Object.defineProperty(n, '$raw', { value: ast.$source.substring(n.start,n.end) })
  }

  // Walk subtree
  ['body', 'left', 'right', 'object', 'property',
   'callee', 'argument', 'arguments', 'expression',
   'test', 'consequent', 'alternate',
   'declarations',
   'init', 'test', 'update',
  ].forEach(prop => {
    if (prop in n) addParent(ast, n[prop], n)
  })
}
