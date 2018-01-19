'use strict'

const fs = require('fs')

const translate = require('./modules/translate.js')
const lookup = require('./modules/lookup.js')

const Game = require('./modules/game')

const CFG = {}

CFG.TARGETS = require('./target-platforms/platforms')



let srcFile = process.argv[2] || 'data/game.js'
let targetSystem = process.argv[3] || 'arduboy'




// Commandline
if (!module.parent) {
  if (srcFile === '--help') {
    console.log(
`Usage: node build.js <MICROCANVAS_SRC.JS> <TARGET>

Currently supported targets:
${Object.keys(CFG.TARGETS).join(', ')}
`)

  } else {
    build(targetSystem, fs.readFileSync(srcFile), require('path').basename(srcFile)).then(
      (game) => {
        // Save
        fs.writeFileSync('data/ast.json', JSON.stringify(game.ast, null, 2))
        fs.writeFileSync('data/game.json', JSON.stringify(game, null, 2))
        fs.writeFileSync('data/game.ino', game.ino||'')
        fs.writeFileSync('data/compile-log.json', JSON.stringify(game.compileLog, null, 2))
        // flow
        fs.writeFileSync('data/game.flow.js', game.flow.source||'')
        fs.writeFileSync('data/game.flow-ast.json', JSON.stringify(game.flow.ast, null, 2))

      }
    )

  }
}


// Module usage
module.exports = build


function build(target, source, id) {
  const game = new Game(target, id)

  // TODO: this is clearly a hack, should just expose translate/lookup on `game` object
  translate.game = lookup.game = game

  // Parse JS into an AST
  game.source = source.toString()
  game.ast = require('./modules/ast').from(game.source)

  // Re-parse as Flow AST (async)
  const astGen = require('./modules/flow/flow').AST(game).then(
    flow => game.flow = flow
  );


  // Once all async tasks have finished, start translating
  return Promise.all([ astGen ]).then(_ => {
    // Process AST and extract relevant components
    const parsers = [ 'globals', 'main', 'setup-body', 'loop-body', 'function-bodies' ]

    parsers.forEach(parseModule => require('./modules/extract/'+parseModule).parse(game))

    // Build
    game.ino = game.export(target)
  })
  .then( _ => game )
  .catch( e => process.exit(console.error(e) || 1))
}
