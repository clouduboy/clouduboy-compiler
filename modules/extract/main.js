'use strict'

module.exports = { parse }


function parse(game) {
  console.log('Looking for main program - setup() & loop() initializers')

  let initializers = game.ast.body
    .filter(o => o.type === 'ExpressionStatement')
    .map(es => es.expression)
    .filter(ex => ex.type === 'CallExpression' && ex.callee.type === 'MemberExpression' && ex.callee.object.name === game.alias)

  if (!initializers) {
    throw new Error('Invalid MicroCanvas file: initializers (setup/loop) not found.')
  }

  game.initializers = {
    setup: initializers.find(e => e.callee.property.name === 'setup'),
    loop: initializers.find(e => e.callee.property.name === 'loop')
  }

  if (!game.initializers.setup) {
    throw new Error('Required initializer `game.setup()` not found.')
  }
  if (!game.initializers.loop) {
    throw new Error('Required initializer `game.loop()` not found.')
  }
}
