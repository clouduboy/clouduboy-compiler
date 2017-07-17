'use strict'

// Acorn (JS parser)
const acorn = require('acorn')

// The acorn Node constructor
const Node = acorn.parse('function x() {}').body[0].constructor


module.exports = { from }



function from(source) {
  // Parse AST
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
