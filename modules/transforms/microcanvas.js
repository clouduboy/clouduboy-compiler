'use strict'

/**
Transform module for `MicroCanvas.*`

Transforms the main Clouduboy library calls to their C counterparts
It deals with microcanvas (game.*) properties, methods as well as
the supported asset objects (gfxSomething/sfxSomething etc.)
*/

// The group of transforms this transform module describes
const transformFamily = require('path').basename(__filename, '.js')

const collectTransforms = require('../collectTransforms.js')
let availableTransforms

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


  // Make sure we have a list of available transforms
  if (!availableTransforms) availableTransforms=collectTransforms(`${__dirname}/${transformFamily}`)


  // Top level MicroCanvas library property/method access
  if (obj === translate.game.alias) {
    // Transform result
    let tfr

    // Check if we have a method transform for this object
    if (availableTransforms.has(prop+'()')) {
      tfr = require(`./${transformFamily}/${prop}()`)(context)
    }

    // Check if we have a property transform for this object
    if (availableTransforms.has(prop)) {
      tfr = require(`./${transformFamily}/${prop}`)(context)
    }

    // Make sure the transform could handle the node
    if (tfr !== undefined) return tfr
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
