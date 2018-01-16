'use strict'

const getString = require('../getString')
const translate = require('../translate')

const utils = require('../utils')

module.exports = { parse }


function parse(game) {
  console.log('Processing globals')

  // TODO: check for reserved globals, like "arduboy"

  // All variable declarations
  let vars = game.ast.body
  .filter(o => o.type === 'VariableDeclaration')
  .forEach(function (n) {
    if (n.kind === 'const') {
      n.declarations.forEach(dec => {
        // TODO: make sure the resulting expression is a constant expression?
        game.createConstant(getString(dec.id), translate(dec.init))
      })

    } else if (n.kind === 'let') {
      n.declarations.forEach(dec => {
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
        } else if (getString(dec.init) === 'new MicroCanvas') {
          game.alias = dec.id.name

          console.log("MicroCanvas uses the alias: ", game.alias)

        } else {
          let v = game.createVariable(dec.id.name, undefined, undefined, dec)

          // Do size translation on the initializer if necessary
          if (v.typeInfo && v.typeInfo.array === true) {
            v.typeInfo.translatedSize = translate.arrs(v.typeInfo.size)
          }

          game.globals.push(v)

          // Make global accessible via its name
          // TODO: maybe use a WeakMap instead?
          Object.defineProperty(game.globals, dec.id.name, { value: game.globals[game.globals.length-1] })
        }
      })

    // 'var' declarations are okay in globals since we hoist them *anyway*
    } else if (n.kind === 'var') {
      n.declarations.forEach(dec => {
        let v = game.createVariable(dec.id.name, undefined, undefined, dec)

        game.globals.push(v)
        Object.defineProperty(game.globals, dec.id.name, { value: game.globals[game.globals.length-1] })
      })
    }
  })

  // All global function declarations
  game.ast.body
  .filter(o => o.type === 'FunctionDeclaration')
  .forEach(function (dec) {
    let id = getString(dec.id)
    let params = []

    console.log('+ new', dec.generator ? 'generator' : 'function', dec.id.name, dec.params.map(p => getString(p)))

    game.globals.push({
      id: id,
      cid: utils.toSnakeCase(id),
      params: params,
      value: dec,
      type: dec.generator ? 'generator' : 'function'
    })
    game.globals[id] = game.globals[game.globals.length-1]

    // parse function arguments to create local variables
    dec.params.forEach(p => {
      params.push(game.createVariable(getString(p), undefined, undefined, dec))
    })

  })
}
