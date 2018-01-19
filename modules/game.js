'use strict'

const platforms = require('../target-platforms/platforms')

const utils = require('./utils')
const AST = require('./ast').AST



// Game object
function Game(target, id) {
  Object.assign(this, {
    alias: 'game',
    target: target,
    compileLog: [],
    id: id,
    constants: [], globals: [], gfx: [], sfx: [],
    setup: { code: [] },
    loop:  { code: [] },
    functions: [],
  })
}

Game.prototype = Object.assign(Object.create(Game), {
  createConstant: pCreateConstant,
  createVariable: pCreateVariable,

  guessType: pGuessType,
  flowType: pFlowType,

  export: generate
})


// Compile log generation
Object.defineProperty(Game.prototype, '_caller_', {
  get: function() {
    // Fetch new stack trace
    const stack = new Error().stack.split('\n')
    // Fish out caller information from the generated stack trace
    const caller = stack
      // Skip logging functions & select first non-log trace
      // TODO: this skips legit Game calls so we need to limit
      // the regex to actual log calls
      .filter(s => !s.match(/at Game\./))[1]
      // Extract caller function name & file/line number info
      .match(/at (\S+).*?clouduboy-compiler\/(.+)\)/).slice(1).join(' @ ')

    return caller
  }
});

// Generic log function
function log(logLevel, message, additionalInfo) {
  this.compileLog.push({
    lvl: logLevel,
    msg: message,
    src: this._caller_,
  })

  // Add additional info only if specified
  if (additionalInfo) this.compileLog[this.compileLog.length-1].nfo = additionalInfo;

  // Return passed-in message
  // Note that the message may not necessarily be an error itself,
  // we use the Error object here to distinguish between log messages
  // and target device source code, so we can comment out these messages
  // in translate()
  return new Error(message)
}

// Specific log functions
Game.prototype.log   = function(...args) { return log.call(this, 'info', ...args) }
Game.prototype.warn  = function(...args) { return log.call(this, 'warn', ...args) }
Game.prototype.error = function(...args) { return log.call(this, 'error', ...args) }
Game.prototype.debug = function(...args) { return log.call(this, '', ...args) }

module.exports = Game



// Methods available on the Game prototype
function pCreateConstant(id, value, type) {
  const game = this

  // If no type specified, try to guess it
  // PS: constants shouldn't be affected by scope issues
  //if (!type) type = guessType(id, value, 'constant')
  // only explicit types here, do not guess here only on output

  game.constants.push({
    id: id,
    cid: utils.toConstCase(id),
    value: value,
    type: type
  })

  // Make the constant accessible via its id
  game.constants[id] = game.constants[game.constants.length-1]

  console.log('+ new const: %s = %s', game.constants[id].cid, value)
}

function pCreateVariable(id, value, type, declaration) {
  const game = this

  // Create a new variable
  let newVar = {
    id: id,
    cid: utils.toSnakeCase(id),
    value: value,
    type: type
  }

  // If no type specified, try to guess it
  // PS: constants shouldn't be affected by scope issues
  //if (!type) type = guessType(id, value, 'constant')
  // only explicit types here, do not guess here only on output
  if (!type) {
    newVar.type = game.guessType(id, undefined, declaration)

    // Save more precise type info
    if (typeof newVar.type === 'object') {
      newVar.typeInfo = newVar.type
      newVar.type = newVar.typeInfo.type+(newVar.array ? '[]' : '')
    }

    type = newVar.type
    game.debug(`Auto-detecting type of variable "${id}": ${type}`)
  }

  // Value based on type
  if (!value && type) {
    if (declaration.init && declaration.init.type == 'ArrayExpression') {
      newVar.value = declaration.init.elements.map(e => e.raw)
    } else {
      newVar.value = declaration.init ? declaration.init.value : void 0
    }

    value = newVar.value
    console.log('- no initial value supplied, detected: ', value)
  }

  // Find parent scope
  let scope = declaration // fallback
  let scopes = utils.walkParents(scope)
  // TODO: find scope parent
  // TODO: support var/function scope

  let s = scopes.length
  while (--s > 0) if (scopes[s].type === 'BlockStatement') {
    scope = scopes[s]
    break
  }

  // Make variable accessible via it's scope (defining element in AST)
  scope.$variables = scope.$variables || []
  scope.$variables.push(newVar)
  scope.$variables[id] = scope.$variables[scope.$variables.length-1]

  Object.defineProperty(newVar, '$scope', { value: scope })

  console.log('+ new var: %s', scope.$variables[id].cid + ( value ? ' = '+value : ''))
  console.log('  scope: ' + scopes
    .map(x => (x.type ? x.type : (x instanceof Array ? '[]' : typeof x)) + (x.body ? '('+(scope===x?'*':'S')+')':'') )
    .join(' > ') + ' "'+id+'"'
  )

  return newVar
}

function pFlowType(node) {
  const game = this

  let flowParam = AST.nodeAt(AST.getPath(node), game.flow.ast)

  if (!flowParam) console.log(game.log(`Flow typed node cannot be found for: ${AST.log(node)}`).toString())

  return flowParam && detectFlowType(flowParam)
}

function detectFlowType(node) {
  let tA = node, t = {}

  if (node.typeAnnotation) {
    tA = tA.typeAnnotation.typeAnnotation ? tA.typeAnnotation.typeAnnotation : tA.typeAnnotation
  }

  if (tA.type === 'TupleTypeAnnotation') {
    t.array = true

    if (tA.types[0]) {
      const elementType = detectFlowType(tA.types[0])
      if (elementType.flowType) {
        t.flowType = elementType.flowType
      }
    }
  }

  if (tA.type === 'NumberTypeAnnotation') {
    t.flowType = 'number'
  }

  return t
}
function pGuessType(id, value, hint) {
  const game = this

  if (hint === 'constant' && typeof value == 'number' && value >=0 && value < 256) {
    return 'byte'
  }

  if (typeof hint == 'object') {
    if (hint.init) {
      //console.log('- guessing type based on decl.: ', hint.type, hint.init)
      switch (hint.init.type) {
        case 'Literal':
          return 'int' // TODO: strings, floats, bytes & unsigneds

        // myVar = new Array(size)
        case 'NewExpression':
          return { array: true, type: 'int[]', baseType: 'int', size: hint.init.arguments }

        // var = [ ... ]
        case 'ArrayExpression':
          return { array: true, type: 'int[]', baseType: 'int', elements: hint.init.elements.length }
          //return 'byte[]'
      }
    }
  }

  // unsigned int, byte, char, char[]
  return 'int'
}


// Export for target platform
function generate(target) {
  const game = this

  target = target || game.target

  if (typeof platforms[target].export == 'function') {
    console.log('Exporting %s for %s', game.id, target)

    game.ino = platforms[target].export(game)
  } else {
    console.log('Codegen not available for target', target)

    throw('Code export not implemented for platform: '+target)
  }

  return game.ino
}
