'use strict'

const getString = require('../getString')
const isCalling = require('../isCalling')
const translate = require('../translate')

// TODO: fix toplevel import for the library
const PixelData = require('../../node_modules/microcanvas-pixeldata/pixeldata.js');

module.exports = { parse }


function parse(game) {
  console.log('Processing game.setup()')

  let sbody = game.initializers.setup
    .arguments[0] // FunctionExpression TODO: reference
    .body // BlockStatement
    .body

  // Walk the setup-body contents
  // TODO: these should probably live in translate/translateLib
  sbody.forEach(exp => {
    // Load graphics or sound assets
    if (exp.expression
     && exp.expression.type === 'AssignmentExpression'
     && exp.expression.left.type === 'Identifier' // TODO: MemberExpression, like game.state
     && exp.expression.left.name.match(/^(gfx|sfx)/)
    ) {
      loadAsset(game, exp.expression)

    // Try translating the line
    } else if (true) {
      let ln = translate(exp)
      game.setup.code.push(ln)

    } else {
      game.setup.code.push('__parseSetupBody("'+(exp.$raw||getString(exp))+'")')
      console.log('Unknown expression: '+getString(exp))
    }
  })
}

function loadAsset(game, exp) {
  let id = exp.left.name

  // Graphics assets
  if (id.match(/^gfx/)) {
    if (!id in game.gfx) {
      console.warn('Warning: asset '+exp.left.name+' is not declared on the global scope!')
    }

    // LoadGraphics / LoadSprite are both valid methods for loading graphics assets
    if (isCalling(exp.right, game.alias+'.loadGraphics')
     || isCalling(exp.right, game.alias+'.loadSprite')
    ) {
      loadGfx(game, id, exp.right.arguments)
      console.log(' 👾 loaded %s as GFX', id)
    } else {
      console.log('Unknown GFX load format: '+JSON.stringify(exp.right.callee))
    }
  }

  if (id.match(/^sfx/)) {
    if (!id in game.sfx) {
      console.warn('Warning: asset '+exp.left.name+' is not declared on the global scope!')
    }

    if (isCalling(exp.right, game.alias+'.loadTune')) {
      loadSfx(game, id, exp.right.arguments)
      console.log(' 🔔 loaded %s as SFX', id)
    } else {
      console.log('Unknown SFX load format: '+getString(exp.right.callee))
    }
  }
}

function loadGfx(game, id, args) {
  let str = getString(args[0])

  // Load graphics data
  //game.gfx[id].value = arrayInitializerContent(str)

  // Parse hints and create constants for them
  //game.gfx[id].meta = arrayInitializerHints(game.gfx[id].value)
  let px = new PixelData(str)

  game.gfx[id].meta = px
  game.gfx[id].value = px.c()

  game.createConstant(id+'Width', px.w)
  game.createConstant(id+'Height', px.h)
  game.createConstant(id+'Frames', px.frames)
  game.createConstant(id+'Framesize', Math.ceil(px.h/8)*px.w)
}

function loadSfx(game, id, args) {
  let str = getString(args[0])
  game.sfx[id].value = arrayInitializerContent(str)
}


function arrayInitializerContent(statement) {
  try {
    return ( statement
      .replace(/\r|\n|\t/g, ' ') // remove line breaks and tabs
      .match(/=\s*[{\[](.*)[}\]]/)[1] // match core data
      .replace(/\s+/g, ' ').trim() // clean up whitespace
    ) || statement
  } catch(e) {}

  return statement
}

function arrayInitializerHints(statement) {
  let ret = {}

  let m = statement.match(/(?:\/\/|\/\*)\s*(\d+)x(\d+)(?:x(\d+))?/)

  if (m && m[1] && m[2]) {
    ret.w = parseInt(m[1],10)
    ret.h = parseInt(m[2],10)
    ret.frames = m[3] ? parseInt(m[3],10) : 0
  }

  return ret
}
