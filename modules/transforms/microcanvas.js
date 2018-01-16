'use strict'

/**
Transform module for `MicroCanvas.*`

Transforms the main Clouduboy library calls to their C counterparts
It deals with microcanvas (game.*) properties, methods as well as
the supported asset objects (gfxSomething/sfxSomething etc.)
*/

const { AST } = require('../ast')

// TODO: remove dependency
const lookup = require('../lookup')


module.exports = function(context) {
  // Expand passed-in context object
  const { translate, exp, obj, prop, callexp } = context

  // embedded member access: <deepObj>[...].<prop>
  const deepObj = AST.getMemberExpressionDeepObjectId(exp)

  // Authority check: bail early if cannot translate the node
  if (!(
    obj === translate.game.alias // MicroCanvas library property/call
    || obj.match(/^(g|s)fx/) // MicroCanvas graphics/sound/etc asset
    || deepObj && deepObj.match(/^gfx/) // Microcanvas multi-frame graphics asset
  )) return undefined


  // MicroCanvas library property/method access
  if (obj === translate.game.alias) {
    // Property access
    // TODO: auto-detect available property transforms
    switch (prop) {
      case 'width':
      case 'height':
      case 'state':
      case 'frameCount':
      case 'frameRate':
      case 'playbackRate':
        return require('./microcanvas/'+prop)(context)
    }

    // MicroCanvas library method calls
    if (callexp) {
      // TODO: auto-detect available library call transforms, or at least try-catch
      // transforms that are not available (as those currently crash on missing require)
      return require('./microcanvas/'+prop+'()')(context)
    }
  }


  // Graphics asset property
  if (
    obj.match(/^gfx/) || // gfxSomething.<prop>
    deepObj && deepObj.match(/^gfx/) // gfxSomething[...].<prop>
  ) {
    // PixelData web canvas object properties
    // exp.property.type = 'Identifier'
    switch (prop) {
      case 'width':
      case 'height':
      case 'frames':
        // Prepare property for lookup by turning it to snake case
        // e.g.: gfxFooBar.width => gfxFooBarWidth
        let id = (deepObj||obj) + prop[0].toUpperCase() + prop.slice(1)

        // The property should be in the game constants, as all loaded images in
        // setup() generate their own constants for all the target properties above
        if (id in translate.game.constants) {
          return translate.game.constants[id].cid
        } else {
          // This may occur due to a typo or the user forgot to previously load
          // the graphics asset in game.setup()
          // TODO: This is a compiler error condition, figure out a way to report it
          // (e.g. push it to something like translate.game.compileErrors)
          console.log('[!] Constant not found: ', id)
          return `__translateMicroCanvas(${AST.getString(exp)})`
        }
    }

    // Computed frame access (member expression property descriptor is an expression)
    // gfxSomething[ true ? 1 : 0 ]  >>>  gfx_something+GFX_SOMETHING_FRAMESIZE*(true?1:0)
    // exp.property.type = 'Literal', or arbitrary expression
    if (typeof exp.property == 'object') {
      return lookup(obj) + ' + ' + lookup(obj+'Framesize')+'*('+translate(exp.property)+')'
      // TODO: get rid of lookup()s here, use translate
      // translate(exp.object) + ' + ' + translate(ast.Identifier(obj+'Framesize'))+'*('+translate(prop)+')'
    }

  }


  // Sfx (tune) object
  // TODO: this is @experimental, sound (tunes) support should be reviewed
  if (obj.match(/^sfx/)) {
    return { call: '<target>.tunes.playScore',  args: [ obj ] }
  }


  // This transform module could not transform this AST node
  return undefined
}
