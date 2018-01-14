'use strict';

const utils = require('./utils.js');

const getString = require('./getString.js');
const getObject = require('./getObject.js');

const lookup = require('./lookup.js');

const { AST } = require('./ast.js');

let translate;


function translateLib(exp, callexp) {
  let obj, deepObj, prop, id;

  const self = translateLib;

  // A member-style callback (obj.prop(...))
  if (exp.type == 'MemberExpression') {
    obj = getString(exp.object);
    prop = exp.property.type == 'Identifier' ? getString(exp.property) : exp.property;

    if (typeof exp.object === 'object' && 'object' in exp.object) deepObj = getString(exp.object.object);

    //if (typeof prop == 'string') console.log('{%s.%s}', obj, prop); else console.log('{%s[%s]}', obj, getString(prop));

  // A function name
  } else if (exp.type == 'Identifier') {
    id = getString(exp);
  }

  // Build context object
  const context = { translate, exp, callexp, obj, deepObj, prop, id };

  // Function call
  if (id) {
    return lookup(exp) + translate.args(callexp.arguments);

  // Standard library (MicroCanvas) method/property
  } else if (obj === translate.game.alias) {
    switch (prop) {
      // Screen width and height
      case 'width': return require('./translate/microcanvas/width')(context);
      case 'height': return 'HEIGHT';

      // Global game state
      case 'state': return '_microcanvas_state';

      // Global game frame count
      case 'frameCount': return '_microcanvas_frame_counter';

      // Global game framerate
      // TODO: allow setting this in setup()
      case 'frameRate': return '60';

      // Playback rate
      case 'playbackRate':
        let framerateArgs = [ {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Math' },
            property: { type: 'Identifier', name: 'round' }
          },
          arguments: [ {
              type: 'BinaryExpression',
              operator: '*',
              left: { type: 'Literal', value: 60, raw: '60' },
              right: callexp.right
          } ]
        } ];
        return translate.game.target+'.setFrameRate' + translate.args( framerateArgs );

      case 'custom':
        let platforms = getObject(callexp.arguments[0]);
        let target = translate.game.target;

        console.log(platforms);
        if (target in platforms) {
          console.log("+ platform-specific code for", target);
          console.log(platforms[target]);
          return platforms[target];
        }

      case 'random':
        return 'random'+translate.args( callexp.arguments );

      case 'detectCollision':
        translate.game.collisions = true;

        // Optional "precise" argument
        if (callexp.arguments.length === 6) callexp.arguments.push({
          type: 'Literal', value: 'false'
        });
        // TODO: Implement and set default to "true"

        let s1 = callexp.arguments[0];
        let s2 = callexp.arguments[3];

        return 'collides'+translate.args([
          callexp.arguments[0],
          callexp.arguments[1],
          callexp.arguments[2],
          AST.MemberExpression(s1, AST.Identifier('width')),
          AST.MemberExpression(s1, AST.Identifier('height')),

          callexp.arguments[3+0],
          callexp.arguments[3+1],
          callexp.arguments[3+2],
          AST.MemberExpression(s2, AST.Identifier('width')),
          AST.MemberExpression(s2, AST.Identifier('height')),

          AST.Literal( callexp.arguments[3+3+1] ? true : false )
        ]);
        break;
    }

    // Function/library method calls
    if (callexp) {
      // Call to 1:1 library mapping library functions
      if (~[
        'everyXFrames',
        'clear',
      ].indexOf(prop)) {
        return translate.game.target+'.'+prop + translate.args(callexp.arguments);
      }

      // strings in "buttonPressed" are turned into constants
      if (prop === 'buttonPressed') {
        // First argument is the queried button
        let btn = getString(callexp.arguments[0]);

        if (btn in utils.BUTTONS[translate.game.target]) {
          return translate.game.target+'.pressed' + translate.args([ utils.BUTTONS[translate.game.target][btn] ]);
        } else {
          return new Error('Unknown button reference: '+btn);
        }
      }

      if (prop === 'drawImage') {
        const r = require('./translate/microcanvas/drawImage()')(context);
        return r.call + translate.args(r.args)
      }

      if (prop === 'clearImage') {
        const r = require('./translate/microcanvas/clearImage()')(context);
        return r.call + translate.args(r.args)
      }

      if (prop === 'eraseImage') {
        const r = require('./translate/microcanvas/eraseImage()')(context);
        return r.call + translate.args(r.args)
      }

      // drawText
      // sprintf(_microcanvas_textbuffer, "DIST: %d", d);
      // arduboy.setTextSize(3);
      // arduboy.setCursor(0,0);
      // arduboy.print("Sprite\nDemo");
      // translate.game.drawText("Sprite\nDemo", 0,0, 3);
      if (prop === 'drawText') {
        let sA = callexp.arguments;
        // TODO: proper string/concat/cast/etc expression handling
        let text = getString(sA[0]);

        return '{\n'+(
          ( sA[3] ? translate.game.target+'.setTextSize'+translate.args([ sA[3] ])+';\n' : '')+
          translate.game.target+'.setCursor'+translate.args([ sA[1], sA[2] ])+';\n'+
          translate.game.target+'.print'+translate.args([ sA[0] ])
        )+';\n}';// todo subframe slice version
      }

      // fillRect
      // translate.game.fillRect(x,y,w,h);    >>>    arduboy.drawBitmap(x,y, w,h);
      if (prop === 'fillRect' || prop === 'clearRect') {
        let sA = callexp.arguments;
        let clear = (prop === 'clearRect');

        let targetArgs = [
          sA[0], sA[1], sA[2], sA[3],
          clear ? 'BLACK' : 'WHITE'
        ];

        return translate.game.target+'.fillRect' + translate.args(targetArgs);
      }

      // soundPlaying
      // game.soundPlaying()    >>>    arduboy.tunes.playing()
      if (prop === 'soundPlaying') {
        return translate.game.target+'.tunes.playing()';
      }

      // run
      // game.run(generator)    >>>    generator()
      if (prop === 'run') {
        return lookup(callexp.arguments[0])+translate.args([]);
      }

    }

  // Graphics asset property
  } else if (obj.match(/^gfx/) ||
    deepObj && deepObj.match(/^gfx/)
  ) {
    switch (prop) {
      case 'width':
      case 'height':
      case 'frames':
        let id = (deepObj||obj) + prop[0].toUpperCase() + prop.slice(1);
        if (id in translate.game.constants) {
          return translate.game.constants[id].cid;
        } else {
          console.log('[!] Constant not found: ', id);
        }
    }

    // Computed property (e.g. frame access)
    if (typeof prop == 'object') {
      // TODO: proper type checking
      return lookup(obj) + ' + ' + lookup(obj+'Framesize')+'*('+translate(prop)+')';
    }

  // Sfx (tune) object
  } else if (obj.match(/^sfx/)) {
    return translate.game.target + '.tunes.playScore' +translate.args([ lookup(obj) ]);

  // Standard maths calls cross-compilation
  } else if (obj === 'Math') {
    switch (prop) {
      // Math.round
      case 'round':
        return 'round' + translate.args(callexp.arguments);

      // Math.floor
      // Math.abs
      case 'floor':
        return 'floor' + translate.args(callexp.arguments);

      case 'abs':
        return 'abs' + translate.args(callexp.arguments);

      // Math.random
      case 'random':
        return 'random' + translate.args(callexp.arguments);
    }
  }

  return '__translateLib("'+(callexp&&callexp.$raw||getString(exp))+'")';
}



module.exports = function(callback) {
  translate = callback;
  return translateLib;
};
