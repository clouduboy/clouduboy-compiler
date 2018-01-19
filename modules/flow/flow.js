"use strict"

const fs = require('fs-extra')

const execa = require('execa')
const uuid = require('uuid/v1')

const FLOW_HEADER = "/* @flow */"
const FLOW_BIN = './node_modules/.bin/flow'


// flow check
function cmdFlowCheck(file) { return `${FLOW_BIN} check ${file}` }

// flow suggest
function cmdFlowSuggest(file) { return `${FLOW_BIN} suggest ${file} --quiet | patch ${file}  &> /dev/null && cat ${file}` }
// TODO: use https://github.com/marcelklehr/diff_match_patch ?

// flow ast
function cmdFlowAST(file) { return `${FLOW_BIN} ast ${file} --pretty` }


// Module
module.exports = {
  suggest: (from) => {
    let tmp

    return createTempFile(from)
      .then( temp => tmp = temp )
      .then( _ => flowSuggest(tmp.file) )
      .then( r => {
        tmp.cleanup()
        return r
      })

      // Catch any errors & clean up
      .catch(e => {
        tmp.cleanup()
        return e
      })
  },

  AST: (from) => {
    let tmp

    return createTempFile(from)
      .then( temp => tmp = temp )
      .then( _ => flowAST(tmp.file) )
      .then( r => {
        tmp.cleanup()
        return r
      })

      // Catch any errors & clean up
      .catch(e => {
        tmp.cleanup()
        console.log(e)
        return e
      })
  }
}


// CLI
if (!module.parent) {
  const cmd = process.argv[2] || 'help',
        srcFile = process.argv[3]

  // Usage
  if (cmd === 'help' || cmd === '--help') console.log(
`Usage: node flow.js  {check|suggest|ast} <MICROCANVAS_SRC.JS>

help      This information
check     Check MicroCanvas source for Flow errors
suggest   Patch MicroCanvas source with Flow-suggested inferred type annotations
ast       Parse the MicroCanvas source into a JSON AST
          (it automatically runs source through "suggest" first)
`)

  if (cmd === 'suggest') {
    module.exports.suggest(srcFile)
      .then( r => console.log(r))
      .then( e => console.error(e))
  }

  if (cmd === 'ast') {
    module.exports.AST(srcFile)
      .then( r => console.log(JSON.stringify(r, null, 2)))
      .then( e => console.error(e))
  }

}



// Suggests type annotations. If no outFile specified will use a temp file.
// Returns the new Flow-enabled JS source with all inferred type annotations inline
function flowSuggest(file) {
  // We need to add the Flow header to the input file to get anything useful
  return fs.writeFile(
    file,
    // Prepend flow header to original source & write it to the temp file
    FLOW_HEADER + fs.readFileSync(file).toString()
  )
  .then(
    _ => execa.shell(cmdFlowSuggest(file))
  )
  .then(result => result.stdout)
}


// Generates the flow AST. Will infer types, unless otherwise specified.
// Returns an object with the string source and the AST as a JS Object
// TODO: maybe use flow-parser? https://www.npmjs.com/package/flow-parser
function flowAST(file, suggest = true) {
  let source,
      suggestStep

  // Suggest type annotations?
  if (suggest) {
    suggestStep = flowSuggest(file)

  // Just use current source
  } else {
    suggestStep = Promise.resolve(fs.readFileSync(file).toString())
  }

  // Generate AST, include original (potentially patched/typed)
  // source in return value
  return suggestStep
    .then(
      s => source = s
    )
    .then(
      _ => execa.shell(`${cmdFlowAST(file)}`)
    )
    .then(
      result => ({ source, ast: JSON.parse(result.stdout) })
    )
}

// Here we cannot use the usual /tmp/ temp-files as they make configuring Flow
// a pain so we create a temp file in the same dir as our source and will
// clean it up once we are done.
function createTempFile(from) {
  let file = `${__dirname}/.flow-tmp-${uuid()}.js`

  // Use this to clean the tempfile up after processing
  let tmp = Object.create(String.prototype)
  Object.defineProperty(tmp, 'file', { value: file })
  Object.defineProperty(tmp, 'toString', { value: () => file })
  Object.defineProperty(tmp, 'cleanup', { value: () => fs.unlink(file) })

  // Source code passed in as a string
  if (typeof from === 'object') {
    fs.writeFileSync(tmp.file, from.src||from.source||'')
  }


  // Optionally initialize
  return typeof from === 'string' ? fs.copy(from, tmp.file).then(_ => tmp) : Promise.resolve(tmp)
}
