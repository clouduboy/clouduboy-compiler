// Pre-processes source code files by replacing template directives
// with values supplied in the params object or in the compilation
// context

// Library to parse a.b.c string references into
// appropriate property accesses
const dp = require('dot-prop');


// Preprocesses code generator template sources
module.exports = function(source, params, context = this) {
  const prop = dp.get.bind(dp, Object.assign(Object.create(null), context, { params }))

  // Preprocesses template-string-like ( ${foo.bar} ) directives
  // TODO: only undefined (in prop(accessor)) should result in ommission ('')
  source = source.replace(/\${([^}]*)}/g, (match, accessor) => prop(accessor)||'')

  return source
}
