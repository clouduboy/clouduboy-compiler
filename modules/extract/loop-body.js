'use strict'

const translate = require('../translate')

module.exports = { parse }


function parse(game) {
  console.log('Processing game.loop()')

  let loopbody = game.initializers.loop
    .arguments[0] // FunctionExpression TODO: reference
    .body // BlockStatement
    .body

  // Walk the setup-body contents
  loopbody.forEach(exp => {
    let ln = translate(exp)
    game.loop.code.push(ln)
  })
}
