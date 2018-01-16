'use strict'

const path = require('path'),
      fs = require('fs')


// Collect all the available transforms from a transform module folder
module.exports = function collectTransforms(inDir) {
  // List transforms folder
  return new Set(
    fs.readdirSync(inDir)
    // Find all modules
    .filter(f => f.match(/\.js$/))
    // Strip file extension
    .map(f => path.basename(f, '.js'))
  )
}
