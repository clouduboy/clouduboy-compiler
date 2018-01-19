'use strict'

const getString = require('../getString')
const translate = require('../translate')

const utils = require('../utils')

module.exports = { parse }


function parse(game) {
  console.log('Processing globals')

  // TODO: check for reserved globals, like game.target

  // All variable declarations
  let vars = game.ast.body.forEach(function (n) {
    if (n.kind === 'const') {
      n.declarations
      // Skip function valued
      .filter(decl => !decl.init || (decl.init.type !== 'FunctionExpression' && decl.init.type !== 'ArrowFunctionExpression'))
      .forEach(dec => {
        // TODO: make sure the resulting expression is a constant expression?
        game.createConstant(getString(dec.id), translate(dec.init))
      })

    } else if (n.kind === 'let') {
      n.declarations
      // Skip function valued
      .filter(decl => !decl.init || (decl.init.type !== 'FunctionExpression' && decl.init.type !== 'ArrowFunctionExpression'))
      .forEach(dec => {
        // Graphics asset
        if (dec.id.name.match(/^gfx/)) {
          game.gfx.push({
            id: dec.id.name,
            cid: utils.toSnakeCase(dec.id.name)
          })
          game.gfx[dec.id.name] = game.gfx[game.gfx.length-1]

        // Sound asset
        } else if (dec.id.name.match(/^sfx/)) {
          game.sfx.push({
            id: dec.id.name,
            cid: utils.toSnakeCase(dec.id.name)
          })
          game.sfx[dec.id.name] = game.sfx[game.sfx.length-1]

        // MicroCanvas standard library hook
        } else if (dec.init && dec.init.type === 'NewExpression' && dec.init.callee.name === 'MicroCanvas') {
          game.alias = dec.id.name

          game.log(`MicroCanvas uses the alias: "${game.alias}"`)

        } else {
          let v = game.createVariable(dec.id.name, undefined, undefined, dec)

          // Do size translation on the initializer if necessary
          if (v.typeInfo && v.typeInfo.array === true) {
            // Size is an expression
            if (typeof v.typeInfo.size === 'object') {
              v.typeInfo.translatedSize = translate.arrs(v.typeInfo.size)

            // Size is an element number
            } else if (typeof v.typeInfo.elements === 'number') {
              v.typeInfo.translatedSize = `${v.typeInfo.elements}*LENGTHOF(${v.cid})`
            }

          // There is an initializer but no value was detected, we are going to
          // create the initializer via translate()
          } else if (dec.init && !v.value) {
            v.value = translate(dec.init)
          }

          game.globals.push(v)

          // Make global accessible via its name
          // TODO: maybe use a WeakMap instead?
          Object.defineProperty(game.globals, dec.id.name, { value: game.globals[game.globals.length-1] })
        }
      })

    // 'var' declarations are okay in globals since we hoist them *anyway*
    } else if (n.kind === 'var') {
      // Skip function valued declarations
      n.declarations
      .filter(decl => !decl.init || (decl.init.type !== 'FunctionExpression' && decl.init.type !== 'ArrowFunctionExpression'))
      .forEach(dec => {
        let v = game.createVariable(dec.id.name, undefined, undefined, dec)

        game.globals.push(v)
        Object.defineProperty(game.globals, dec.id.name, { value: game.globals[game.globals.length-1] })
      })
    }
  })

  // All global function declarations
  let funcDecls = game.ast.body.filter(o => o.type === 'FunctionDeclaration')
    // Plus all function-valued variable declarations
    .concat(
      // Take the body (top-level global-scope only)
      game.ast.body
        // Take all variable declarations
        .filter(o => o.type === 'VariableDeclaration')
        // Choose the ones containing function expressions or arrow functions
        .map(v => v.declarations.filter(
          decl => decl.init && (decl.init.type === 'FunctionExpression' || decl.init.type === 'ArrowFunctionExpression')
        // These functions doesn't have their own name (id) so
        // we take it from the declaration instead
        ).map(decl => { decl.init.id = decl.id; return decl.init }))
        // One variable declarator may contain several actual
        // declarations, we collect those into a single, flat array
        .reduce((a,b) => { return a.concat(b); }, [])
    )

  funcDecls.forEach(function (dec) {
    const id = getString(dec.id),
          params = []

    // TODO: Return type detection

    game.globals.push({
      id,
      cid: utils.toSnakeCase(id),
      params,
      value: dec,
      type: dec.generator ? 'generator' : 'function'
    })

    // Alternate mapping via id
    game.globals[id] = game.globals[game.globals.length-1]

    // Parse function arguments to create local variables
    game.globals[id].params.push(...dec.params.map(p => {
      // Type detection via Flow
      let tA = game.flowType(p)
      return game.createVariable(getString(p), undefined, tA, dec)
    }))

    console.log(`+ ${dec.generator ? 'generator' : 'function'} ${id}( ${params.map(p => p.type+' '+p.id).join(', ')})`)

  })
}
