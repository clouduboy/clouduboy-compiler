'use strict';

const getString = require('./getString.js');
const utils = require('./utils.js');
const AST = require('./ast.js').AST;


function lookup(exp, extended = false) {
  let id = getString(exp);

  let self = lookup;

  // it's the MicroCanvas alias
  // TODO: shouldn't this return translate.game.target instead?
  if (id === self.game.alias) return id;

  // It's an asset
  if (id in self.game.gfx) {
    if (extended) {
      return {
        type: 'GfxAsset',
        descriptor: self.game.gfx[id],
        translated: self.game.gfx[id].cid
      }
    }

    return self.game.gfx[id].cid;
  }
  if (id in self.game.sfx) {
    return self.game.sfx[id].cid;
  }

  // It's a built-in library global or constant
  // TODO: move this to a global and make it configurable (e.g. dependent on target)
  if (id.match(/^(TRUE|FALSE|WIDTH|HEIGHT|WHITE|BLACK|INVERT|_microcanvas_textbuffer)$/)) {
    return id;
  }

  // It's an animation-related function (e.g. an easing function)
  if (id.match(/^(easeCubicIn)$/)) {
    // enable animations support
    self.game.animations = true;

    return utils.toSnakeCase(id);
  }

  // Try to resolve identifier on the current scope
  let scopes = utils.walkParents(exp).reverse();
  for (let i=0; i<scopes.length; ++i) {
    if (scopes[i].$variables && scopes[i].$variables[id]) {
      let v = scopes[i].$variables[id];

      // Provide extended info on lookup result
      if (extended) {
        return {
          type: "ScopedVariable",
          scopeLevel: i,
          scopes,
          translated: v.cid
        }
      }

      return v.cid;
    }
  }

  // It's a global constant
  if (id in self.game.constants) {
    return self.game.constants[id].cid;
  }

  // It's a global variable
  if (id in self.game.globals) {
    // Provide extended info on lookup result
    if (extended) {
      return {
        type: "GlobalVariable",
        descriptor: self.game.globals[id],
        translated: self.game.globals[id].cid
      }
    }

    return self.game.globals[id].cid;
  }

  //return '__lookup("'+(scopes.map( scope => scope.type ).join('>'))+'>'+(exp.$raw||id)+'")';
  return self.game.error(`${AST.log(exp)} — unable to resolve identifier on current scope.`)
}



module.exports = lookup;
