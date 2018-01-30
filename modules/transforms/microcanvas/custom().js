// TODO: game.custom({ ... });   >>>    <custom target-specific behavior>

/**
@experimental
(`void`) Define custom, platform-specific behaviors

This is the browser-sniffing (IE conditional comments, C preprocessor, etc.) of
the Clouduboy compiler/MicroCanvas. Any code valid on the target platform can be
used in the target-specific code-block and will appear verbatim (unmodified) in
the resulting translated source.

This can be used to access device-specific functionality (e.g. device-specific
sensors or components like LEDs), for performance tuning (it is possible to
output inline assembly or hand-unrolled loops etc.) or polyfilling functionality
that the `clouduboy-compiler` does not currently support.
*/

const { AST } = require('../../ast')


module.exports = (context) => {
  const {translate, callexp} = context;

  // Retrieve the JS object-literal that was passed to the node
  const platforms = AST.getObject(callexp.arguments[0])

  // Current transpile target
  const target = translate.game.target

  // If we have the current platform in the list of platform-specific code
  // snippets output that code
  // TODO: in template literals handle syntax like ${game.id(varName)} (syntax TBD)
  // to make it easier to access bindings in C (this will translate varName => var_name.)
  // As an added bonus this will also take care of variable visibility, since Flow will
  // now check and warn if the specified binding (be that a function or variable name)
  // is not available in the current scope!
  if (target in platforms) {
    // TODO: make compiler (debug) message
    //console.log("+ platform-specific code for", target, platforms[target])

    return platforms[target]
  }

  // TODO: make compiler (info) message
  return `/* game.custom(): no code specified for current target: '${target}' */`
}
