'use strict'

const path = require('path')
const fs = require('fs')


module.exports = function(game) {
  let b = '';

  // Header
  b += header().trim()+'\n\n';

  // Macro Helpers
  b += builtins('arrays').trim()+'\n\n';


  // Assets
  // Graphics
  if (game.gfx) {
  game.gfx.forEach(asset => {
      b += gfx(asset.cid, asset.value
        // TODO: only if bit density is high enough (1/2 bytes per pixel)
        //,asset.meta.w+'*'+asset.meta.h+'*'+asset.meta.frames
      );
    });
    b+='\n';
  }

  // Sounds
  if (game.sfx) {
    game.sfx.forEach(asset => {
      b += sfx(asset.cid, asset.value);
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
        b += c.typeInfo.type +' '+ c.cid + c.typeInfo.translatedSize

      } else if (c.type && (c.type == 'char[]' || c.type == 'byte[]')) {
        b += c.type.substr(0,4) +' '+ c.cid +'[]'

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
    b += builtins('animations').trim()+'\n\n';
  }
  if (game.generators) {
    b += builtins('generators').trim()+'\n\n';
  }
  if (game.collisions) {
    b += builtins('collisions').trim()+'\n\n';
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
          return (param.type ? param.type : game.guessType(param.id, param.value)) + ' ' +param.cid;
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

  // Setup
  b+=setup(game.setup.code.join('\n'))+'\n';

  // Loop
  b+=loop(game.loop.code.join('\n'))+'\n';

  return b;
}

function header() {
  return (
    fs.readFileSync(path.join(__dirname, 'base.ino'))
      .toString()
    )
}

function gfx(id, data, dimensions) {
  return (
    fs.readFileSync(path.join(__dirname, 'assets/gfx.ino'))
      .toString()
      .replace('$__id__', id)
      .replace('$__data__', data)
      .replace('$__dimensions__', dimensions||'')
    )
}

function sfx(id, data) {
  return (
    fs.readFileSync(path.join(__dirname, 'assets/sfx.ino'))
      .toString()
      .replace('$__id__', id)
      .replace('$__data__', data)
    )
}

function setup(contents) {
  return (
    fs.readFileSync(path.join(__dirname, 'setup.ino'))
      .toString()
      .replace('$__contents__;', contents)
    )
}

function loop(contents) {
  return (
    fs.readFileSync(path.join(__dirname, 'loop.ino'))
      .toString()
      .replace('$__contents__;', contents)
    )
}

function builtins(id) {
  switch (id) {
    // TODO: implement in C for the Arduboy/PROGMEM
    case 'collisions':
      return fs.readFileSync(path.join(__dirname, 'built-ins/collides.ino')).toString();

    case 'generators':
      return fs.readFileSync(path.join(__dirname, 'built-ins/microcanvas_yield.ino')).toString();

    case 'animations':
      // TODO: conditional loading of used easings and features
      return fs.readFileSync(path.join(__dirname, 'built-ins/ease_cubic_in.ino')).toString();

    case 'arrays':
      return fs.readFileSync(path.join(__dirname, 'built-ins/LENGTHOF.ino')).toString();
  }
}
