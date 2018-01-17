// run
// game.run(generator)    >>>    generator()
if (prop === 'run') {
  return lookup(callexp.arguments[0])+translate.args([]);
}
