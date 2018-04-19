'use strict'

const path = require('path')

const preprocess = require('./lib/preprocess')
const load = require('./lib/load')



module.exports = function(game) {
  let ctx = Object.assign(Object.create(null), game, {
    generateHeader, generateAssets, generateSetup, generateLoop, generateBuiltIn,
    src: path.join(__dirname, 'platform', game.target),
    basedir: path.join(__dirname, 'platform/default'),
    load, preprocess
  })

  let b = '';

  // Header
  b += ctx.generateHeader()+'\n\n';

  // Macro Helpers
  b += ctx.generateBuiltIn('arrays')+'\n\n';


  // Assets
  // Graphics
  if (game.gfx) {
    game.gfx.forEach(asset => {
      b += ctx.generateAssets('gfx', {
        id: asset.cid,
        data: asset.value,
        //dimensions: DEPRECATED
      }) + '\n';
    });
    b+='\n';
  }

  // Sounds
  if (game.sfx) {
    game.sfx.forEach(asset => {
      b += ctx.generateAssets('sfx', {
        id: asset.cid,
        data: asset.value
      });
    });
    b+='\n';
  }

  // Constants
  if (game.constants) {
    game.constants.forEach(c => {
      b += 'const ' + (c.type ? c.type : game.guessType(c.id, c.value, 'constant')) + ' ';
      b += c.cid;

      if (typeof c.value !== 'undefined') {
        b += ' = ' + c.value;
      }

      b+=';\n';
    });
    b+='\n';
  }

  // Globals
  if (game.globals) {
    game.globals.filter(dec => dec.type!=='function'&&dec.type!=='generator').forEach(c => {
      // Array initializer
      if (c.typeInfo ) {
        if (c.typeInfo.array) {
          b += c.typeInfo.baseType +' '+ c.cid + (c.typeInfo.size ? c.typeInfo.translatedSize : '[]')
        }

      } else {
        b += (c.type ? c.type : game.guessType(c.id, c.value)) +' ';
        b += c.cid;
      }

      if (typeof c.value !== 'undefined') {
        // Array initializer value
        if (typeof c.value == 'object' && c.value.length) {
          b += ' = { ' +c.value.join(', ')+ ' }'
        } else {
          b += ' = ' + c.value;
        }
      }

      b+=';\n';
    });
    b+='\n';
  }

  // Optional built-ins
  if (game.animations) {
    b += ctx.generateBuiltIn('animations')+'\n\n';
  }
  if (game.generators) {
    b += ctx.generateBuiltIn('generators')+'\n\n';
  }
  if (game.collisions) {
    b += ctx.generateBuiltIn('collisions')+'\n\n';
  }

  // Functions
  if (game.functions) {
    game.functions.forEach(f => {
      if (f.fobj.type === 'generator') {
        b += 'boolean ';
      } else {
        b += (f.fobj.rtype ? f.fobj.rtype : 'void') + ' ';
      }
      b += f.fobj.cid;

      b += '(';
      if (f.fobj.params) {
        b += f.fobj.params.map(param => {
          // Array types
          const pType = param.typeInfo && param.typeInfo.array ? param.typeInfo.baseType+'*' : (param.type ? param.type : game.guessType(param.id, param.value))

          return pType + ' ' +param.cid;
        }).join(', ');
      }
      b += ')';

      b += ' {\n';
      b += '////// FUNCTION BODY //////\n';
      b += f.code.join('\n')+'\n';

      if (f.fobj.type === 'generator') {
        b += 'return true;' // ended
      }
      b += '\n}\n';
    });
    b+='\n';
  }

  // Append stdlib
  b+=ctx.load(`stdlib.ino`)+'\n';


  // Setup
  b+=ctx.generateSetup({
    contents: game.setup.code.join('\n')
  })+'\n';

  // Loop
  b+=ctx.generateLoop({
    contents: game.loop.code.join('\n')
  })+'\n';


  return b;
}



function generateHeader() {
  return this.load('base.ino')
}

function generateAssets(assetType, params) {

  return this.load(`assets/${assetType}.ino`, params)
}

function generateSetup(params) {
  return this.load(`setup.ino`, params)
}

function generateLoop(params) {
  return this.load(`loop.ino`, params)
}

function generateBuiltIn(id) {
  switch (id) {
    // TODO: implement in C for the Arduboy/PROGMEM
    case 'collisions':
      return this.load('built-ins/collides.ino')

    // NOTE: legacy/broken/deprecated
    case 'generators':
      return this.load('built-ins/microcanvas_yield.ino')

    case 'animations':
      // TODO: conditional loading of used easings and features
      return this.load('built-ins/ease_cubic_in.ino')

    case 'arrays':
      return this.load('built-ins/LENGTHOF.ino')
  }
}
