// Loads a file from the specified path and preprocesses
// its contents. If the file is not found it will try to
// fall back to the "basedir" version.

const path = require('path')
const fs = require('fs')



module.exports = function(file, params, context = this) {
  let src = path.join(context.src, file)
  if (!fs.existsSync(src)) {
    src = path.join(context.basedir, file)
  }

  return context.preprocess(
    fs.readFileSync(src).toString()
  , params).trim()
}
