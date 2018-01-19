'use strict'

const translate = require('../translate')

module.exports = { parse }


function parse(game) {
  game.globals.forEach(dec => {
    if (dec.type === 'function') {
      console.log('Processing function '+dec.cid+'()');
      let f = { fobj: dec, code: [] };

      let funcbody = dec.value // FunctionDeclaration; TODO: FunctionExpression
        .body // BlockStatement
        .body;

      // Walk the body contents
      funcbody.forEach(exp => {
        let ln = translate(exp);
        f.code.push(ln);
      });

      // Guess return type
      if (f.code.filter(ln => ln.match(/return/)).length) {
        f.fobj.rtype = 'int';

      // no return statements: void
      } else {
        f.fobj.rtype = 'void';
      }
      // TODO: walk AST instead, find 'ReturnStatement'
      // TODO: guess return type from 'ReturnStatement' value objecttype

      game.functions.push(f);
    } else if (dec.type === 'generator') {
      console.log('Translating generator function "'+dec.cid+'()"');
      let f = { fobj: dec, code: [] };

      let funcbody = dec.value // FunctionDeclaration; TODO: FunctionExpression
        .body // BlockStatement
        .body;

      // Walk the body contents
      funcbody.forEach(exp => {
        let ln = translate(exp);
        f.code.push(ln);
      });

      game.functions.push(f);
    }

  });
}
