 'use strict';

const fs = require('fs');

const utils = require('./modules/utils.js')

const translate = require('./modules/translate.js');
const lookup = require('./modules/lookup.js');
const getString = require('./modules/getString.js');

const PixelData = require('./node_modules/microcanvas-pixeldata/pixeldata.js');

let srcFile = process.argv[2] || './game.js';
let targetSystem = process.argv[3] || 'arduboy';

let game;


// Game object
function Game(target) {
  Object.assign(this, {
    alias: 'game',
    target: target,
    constants: [], globals: [], gfx: [], sfx: [],
    setup: { code: [] },
    loop:  { code: [] },
    functions: [],
  });
}

Object.assign(Game.prototype, {
  createConstant: pCreateConstant,
  createVariable: pCreateVariable,

  guessType: pGuessType,

  export: exportGame
})


// Commandline
if (!module.parent) {
  if (srcFile === '--help') {
    console.log('Usage: node build.js <MICROCANVAS_SRC.JS> <TARGET>\n\nCurrently supported targets: arduboy');

  } else {
    buildGame(targetSystem, fs.readFileSync(srcFile), require('path').basename(srcFile));

    // Save
    fs.writeFileSync('ast.json', JSON.stringify(game.ast));
    fs.writeFileSync('game.json', JSON.stringify(game));
    fs.writeFileSync('game.ino', game.ino||'');
  }
}


// Module usage
module.exports = buildGame;


function buildGame(target, source, id) {
  translate.game = lookup.game = game = new Game();

  game.id = id;
  game.target = target;

  game.ast = require('./modules/ast').from(source.toString())

  // Parse
  parseGlobals();

  parseInitializers();

  parseSetupBody();

  parseLoopBody();

  parseGlobalFunctions();

  // Build
  game.ino = game.export(target);

  return game;
}


// Methods available on the Game prototype
function pCreateConstant(id, value, type) {
  // If no type specified, try to guess it
  // PS: constants shouldn't be affected by scope issues
  //if (!type) type = guessType(id, value, 'constant');
  // only explicit types here, do not guess here only on output

  game.constants.push({
    id: id,
    cid: utils.toConstCase(id),
    value: value,
    type: type
  });

  // Make the constant accessible via its id
  game.constants[id] = game.constants[game.constants.length-1];

  console.log('+ new const: %s = %s', game.constants[id].cid, value);
}

function pCreateVariable(id, value, type, declaration) {
  // If no type specified, try to guess it
  // PS: constants shouldn't be affected by scope issues
  //if (!type) type = guessType(id, value, 'constant');
  // only explicit types here, do not guess here only on output
  if (!type) {
    type = game.guessType(id, undefined, declaration)
    console.log('- no type information, guessed: ', type)
  }

  // Value based on type
  if (!value && type) {
    if (declaration.init && declaration.init.type == 'ArrayExpression') {
      value = declaration.init.elements.map(e => e.raw)
    } else {
      value = declaration.init ? declaration.init.value : void 0
    }

    console.log('- no initial value supplied, detected: ', value)
  }

  let newVar = {
    id: id,
    cid: utils.toSnakeCase(id),
    value: value,
    type: type
  };

  // Find parent scope
  let scope = declaration; // fallback
  let scopes = utils.walkParents(scope);
  // TODO: find scope parent
  // TODO: support var/function scope

  let s = scopes.length;
  while (--s > 0) if (scopes[s].type === 'BlockStatement') {
    scope = scopes[s];
    break;
  }

  // Make variable accessible via it's scope (defining element in AST)
  scope.$variables = scope.$variables || [];
  scope.$variables.push(newVar);
  scope.$variables[id] = scope.$variables[scope.$variables.length-1];

  Object.defineProperty(newVar, '$scope', { value: scope });

  console.log('+ new var: %s', scope.$variables[id].cid + ( value ? ' = '+value : ''));
  console.log('  scope: ' + scopes
    .map(x => (x.type ? x.type : (x instanceof Array ? '[]' : typeof x)) + (x.body ? '('+(scope===x?'*':'S')+')':'') )
    .join(' > ') + ' "'+id+'"'
  );

  return newVar;
}

function pGuessType(id, value, hint) {
  if (hint === 'constant' && typeof value == 'number' && value < 256) return 'byte';

  if (typeof hint == 'object') {
    if (hint.init) {
      console.log('- guessing type based on decl.: ', hint.type, hint.init)
      switch (hint.init.type) {
        case 'Literal':
          return 'int' // TODO: strings, floats, bytes & unsigneds
        case 'ArrayExpression':
          return 'byte[]'
      }
    }
  }

  // unsigned int, byte, char, char[]
  return 'int';
}


// Collect global declarations
function parseGlobals() {
  return require('./modules/extract/globals').parse(game)
}

// Find intializers
function parseInitializers() {
  return require('./modules/extract/main').parse(game)
}

// Parse game.setup call body and generate setup
function parseSetupBody() {
  return require('./modules/extract/setup-body').parse(game)
}

// Parse game.setup call body and generate setup
function parseLoopBody() {
  return require('./modules/extract/loop-body').parse(game)
}

// Parse (global) function declarations
function parseGlobalFunctions() {
  return require('./modules/extract/function-bodies').parse(game)
}



function exportGame(target) {
  let game = this;
  target = target || game.target;

  console.log('Exporting %s for %s', game.id, target);

  switch (target) {
    case 'arduboy':
      let b = '';

      // Header
      b += arduboyHeader().trim()+'\n\n';

      // Assets
      // Graphics
      if (game.gfx) {
      game.gfx.forEach(asset => {
          b += arduboyGfx(asset.cid, asset.value);
        });
        b+='\n';
      }

      // Sounds
      if (game.sfx) {
        game.sfx.forEach(asset => {
          b += arduboySfx(asset.cid, asset.value);
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
          if (c.type && (c.type == 'char[]' || c.type == 'byte[]')) {
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
      if (game.generators) {
        b += arduboyBuiltins('generators').trim()+'\n\n';
      }
      if (game.collisions) {
        b += arduboyBuiltins('collisions').trim()+'\n\n';
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
      b+=arduboySetup(game.setup.code.join('\n'))+'\n';

      // Loop
      b+=arduboyLoop(game.loop.code.join('\n'))+'\n';

      // Functions

      return b;
  }
};

function arduboyHeader() {
  return `
#include <SPI.h>
#include "Arduboy.h"

#include <EEPROM.h>
#include <avr/pgmspace.h>

Arduboy arduboy;

// frame counter, 2-byte unsigned int, max 65536
unsigned int _microcanvas_frame_counter = 0;

// sprintf() textbuffer for drawText
char _microcanvas_textbuffer[32];

// global state machine
unsigned int _microcanvas_state;
`;
}

function arduboyGfx(id, data) {
  return `
PROGMEM const unsigned char ${id}[] = { ${data} };
`;
}

function arduboySfx(id, data) {
  return `
const byte PROGMEM ${id}[] = { ${data} };
`;
}

function arduboySetup(contents) {
  return `
void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////
${contents}
}
`;
}

function arduboyLoop(contents) {
  return `
void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
${contents}
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
`
}

function arduboyBuiltins(id) {
  switch (id) {
    // TODO: implement in C for the Arduboy/PROGMEM
    case 'collisions': return `
boolean collides(const unsigned char* s1, int x1,int y1, int s1_width, int s1_height, const unsigned char* s2, int x2,int y2, int s2_width, int s2_height, boolean precise) {
  boolean result = false;

  // Basic collision rectangle
  int cx = x1>x2 ? x1 : x2;
  int cw = x1>x2 ? x2+s2_width-x1 : x1+s1_width-x2;

  int cy = y1>y2 ? y1 : y2;
  int ch = y1>y2 ? y2+s2_height-y1 : y1+s1_height-y2;

  if (cw>0 && ch>0) {
    result = true;
  }

  // No bounding rect collision or no precise check requested
  if (!precise || !result) {
    return result;
  }


  return false;
}`;

    case 'generators': return `
void _microcanvas_yield(byte n) {
  arduboy.display();
  while(n>0) {
    while (!arduboy.nextFrame()) delay(1);
    --n;
  }
}`;
  }
}
