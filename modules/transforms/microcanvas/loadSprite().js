// game.loadSprite('sprite data [constant]');   >>>   pixeldata declarations;

/**
(`void`) Loads graphics into the canvas.
*/

const { AST } = require('../../ast')

// PixelData library used to process PIF sprites
const PixelData = require('microcanvas-pixeldata');



module.exports = (context) => {
  const {translate: {game, game:{targetPlatform}}, translate, callexp, exp, prop} = context
  console.log(targetPlatform)

  // First argument is always the image descriptor
  // (usually an array, object or (template )string)
  const str = AST.getString(callexp.arguments[0])

  // Second argument is provided usually by extract/globals.js
  // from the parsed variable this value will be assigned to
  const id = callexp.arguments[1]

  console.log('id is:', id)

  // Load graphics data
  const px = new PixelData(str)

  // TODO: TypeError: Cannot set property 'meta' of undefined
  // occurs when gfx image wasn't declared on the global scope.
  // TODO: Auto-fix by adding these to the JS header and updating
  // the script automatically (+notify user of the fix)
  game.gfx[id].meta = px

  // We output the image for the target platform display color bitdepth
  game.gfx[id].value = px.c(targetPlatform.screen.colorDensity)

  game.createConstant(id+'Width', px.w)
  game.createConstant(id+'Height', px.h)
  game.createConstant(id+'Frames', px.frames)

  if (targetPlatform.screen.colorDensity>1) {
    game.createConstant(id+'Framesize', px.h*px.w)
  } else {
    game.createConstant(id+'Framesize', Math.ceil(px.h/8)*px.w)
  }

  if (targetPlatform.screen.colorDensity>1) {
    //console.log(px.b5g6r5[0])
    // TODO: figure out how to specify background (mask) colors in PIFs
    // TODO: this should be in HEX format, and same bitlength as in the data
    game.createConstant(id+'Maskcolor', '0x0000')
  }

  // TODO: game.log
  // No significant output
  return ({})
}
