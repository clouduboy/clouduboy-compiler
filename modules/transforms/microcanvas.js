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


  // A list of applicable concerns (transforms) this module is equipped
  // to execute/handle.
  let concerns = {}

  // MicroCanvas library property access or method call
  concerns.gamePropertyOrMethod = !!(obj === translate.game.alias)

  // Assignment to MicroCanvas property (e.g. game.fillStyle = "white")
  concerns.gamePropertyAssignment = !!(
    exp.type === 'AssignmentExpression'
    && exp.left.type === 'MemberExpression'
    && exp.left.object.name === translate.game.alias
  )

  // MicroCanvas graphics/sound/etc asset (e.g.: gfxSomething.<prop>)
  concerns.gfxAsset = !!(obj && obj.match(/^gfx/))
  concerns.sfxAsset = !!(obj && obj.match(/^sfx/))

  // Microcanvas multi-frame graphics asset (e.g.: gfxSomething[...].<prop>)
  concerns.gfxAsset |= !!(deepObj && deepObj.match(/^gfx/))

  // Authority check: bail early if cannot translate the node
  // We are looking at all concerns' values and if not a single one that
  // applies then we are bailing early
  if (Object.values(concerns).reduce((a,b) => a||b) === false) return undefined


  // Make sure we have a list of available transforms
  if (!availableTransforms) availableTransforms=collectTransforms(`${__dirname}/${transformFamily}`)


  // Top level MicroCanvas library property/method access
  if (concerns.gamePropertyOrMethod) {
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


  // MicroCanvas library property assignment
  if (concerns.gamePropertyAssignment) {
    const property = exp.left.property.name
    let tfr

    // Check if we have a property transform for this object
    if (availableTransforms.has(property)) {
      tfr = require(`./${transformFamily}/${property}`)(context)
    }

    // Make sure the transform could handle the node
    if (tfr !== undefined) return tfr
  }


  // Graphics asset property
  if (concerns.gfxAsset) {
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
          return translate.game.error(`/* [!] Constant "${id}" not found at: ${AST.getString(exp)} */`)
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
  if (concerns.sfxAsset) {
    return { call: '<target>.tunes.playScore',  args: [ obj ] }
  }


  // This transform module could not transform this AST node
  return undefined
}
