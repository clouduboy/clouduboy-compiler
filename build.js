 'use strict'

const fs = require('fs')

const translate = require('./modules/translate.js')
const lookup = require('./modules/lookup.js')

const Game = require('./modules/game')

const CFG = {}

CFG.TARGETS = require('./target-platforms/platforms')



let srcFile = process.argv[2] || './game.js'
let targetSystem = process.argv[3] || 'arduboy'
console.log(process.argv.length)




// Commandline
if (!module.parent) {
  if (srcFile === '--help') {
    console.log(
`Usage: node build.js <MICROCANVAS_SRC.JS> <TARGET>

Currently supported targets:
${Object.keys(CFG.TARGETS).join(', ')}
`)

  } else {
    let game = build(targetSystem, fs.readFileSync(srcFile), require('path').basename(srcFile))

    console.log(typeof game.ino)

    // Save
    fs.writeFileSync('ast.json', JSON.stringify(game.ast))
    fs.writeFileSync('game.json', JSON.stringify(game, null, 2))
    fs.writeFileSync('game.ino', game.ino||'')
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

  // Process AST and extract relevant components
  const parsers = [ 'globals', 'main', 'setup-body', 'loop-body', 'function-bodies' ]

  parsers.forEach(parseModule => require('./modules/extract/'+parseModule).parse(game))


  // Build
  game.ino = game.export(target)

  return game
}
