// TODO: game.custom({ ... });   >>>    <custom target-specific behavior>

/**
@experimental
(`void`) Define custom, platform-specific behaviors

This is the browser-sniffing (IE conditional comments, C preprocessor, etc.) of
the Clouduboy compiler/MicroCanvas.
*/


case 'custom':
  let platforms = getObject(callexp.arguments[0])
  let target = translate.game.target

  console.log(platforms)
  if (target in platforms) {
    console.log("+ platform-specific code for", target)
    console.log(platforms[target])
    return platforms[target]
  }
