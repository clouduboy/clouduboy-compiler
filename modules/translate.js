'use strict';

const getString = require('./getString.js');
const getObject = require('./getObject.js');

const lookup = require('./lookup.js');

const { AST } = require('./ast.js');

const translateLib = require('./translateLib.js')(translate);



function translate(exp, callexp) {
  // Let's just use translate like we do everywhere else
  let self = translate;

  // Simple strings are used as-is (treated as target source code)
  if (typeof exp === 'string') return exp;

  // Error messages are turned into comments
  // TODO: consider removing line numbers
  if (typeof exp === 'object' && exp instanceof Error) {
    return `/* ${exp.message} */`
  }

  // TODO: consider using typeof exp != 'object'
  if (!exp || !exp.type ) {
    // Unrecognized
    return self(translate.game.error(`[!] Unrecognized: invalid node or transform result: ${exp ? AST.log(exp) : typeof exp}`))
  }

  switch (exp.type) {

    // Literals return the textual definiton of the literal
    case 'Literal':
      // exp.raw might contain single-quoted strings and other weirdness
      // so stringifying the actual, typed value is safer here
      return JSON.stringify(exp.value);

    // Look up identifiers
    case 'Identifier': // TODO: we'll need to handle scope (path)
      return lookup(exp);

    // Template literals
    case 'TemplateLiteral':
      // TODO: proper conversion of template literals with embedded expressions
      return JSON.stringify(getString(exp));

    // New expression - objects are not yes supported so this is inert
    case 'ObjectExpression':
    case 'NewExpression':
      return self(self.game.error(`[!] Objects are currently not supported: ${AST.log(exp)}`))

    // Member expressions are usually translated to built-in methods
    case 'MemberExpression':
      const obj = self(exp.object);

      // MicroCanvas calls
      if (true) {
        return self(translateLib(exp, callexp));
      // Some other library
      } else {
        // Property expression
        return '(' + (self(exp.object) + ').' + self(exp.property));
        // TODO: property access belongs to subexpressions, move it there
        // TODO: add one-level-deep ternary support
        // TODO: support bracket notation for complex properties
        // TODO: do not parenthetise simple identifiers
      }

    // Define a new variable on the current scope
    case 'VariableDeclaration':
      return exp.declarations.map(dec => self(dec)).join(' ');

    case 'VariableDeclarator':
      let id = getString(exp.id),
          initializer = exp.init ? self(exp.init) : undefined;

      let v = self.game.createVariable(id, initializer, undefined, exp);

      return (
        (v.type ? v.type : self.game.guessType(v.id, v.value, v.$scope)) + ' '
        + v.cid
        + (typeof v.value !== 'undefined' ? ' = ' + v.value : '')
        + ';'
      );

    // Empty statement (semicolon without any statement for it to end)
    case 'EmptyStatement':
      return ';'

    // Just unwrap expression body
    case 'ExpressionStatement':
      return self(exp.expression) +';';

    // And wrap a block statement
    case 'BlockStatement':
      return '{\n'+exp.body.map(e => '  '+self(e)).join('\n') +'\n}';

    // Loops
    case 'WhileStatement':
      return 'while ('+self(exp.test)+') ' + self(exp.body);

    // For loop
    case 'ForStatement':
      // init / test / update / body
      let loopInit = self(exp.init).replace(/;$/,'');

      return 'for ('+loopInit+'; '+self(exp.test)+'; '+self(exp.update)+') '+self(exp.body);
      break;

    // If statements are all the same
    case 'IfStatement':
      // the && takes higher precedence than the || so this basically
      // means "if exp.* exists, call translate on it, otherwise set
      // the branch to the empty string"
      let con = exp.consequent && self(exp.consequent) || '',
          alt = exp.alternate && self(exp.alternate) || '',
          elseif = (exp.alternate && exp.alternate.type === "IfStatement")

      // Detect multi-expression with no block surrounding it & add curlies
      // The slice gets rid of any trailing semicolons
      if (con.slice(0,-1).indexOf(';') !== -1 && con[0] !== '{') {
        con = '{ '+con+' }';
      }
      // Leave 'else if'-s alone
      if (!elseif && alt.slice(0,-1).indexOf(';') !== -1 && alt[0] !== '{') {
        alt = '{ '+alt+' }';
      }
      // TODO: re-use this for other statements (for, while..)

      return 'if ('+self(exp.test)+') '
        + con
        + ( alt ? ' else ' + alt : '');

    // Similarly, conditionals too
    case 'ConditionalExpression':
      return '('+self(exp.test)
        +( exp.consequent
           ? ' ? '+self(exp.consequent) + ( exp.alternate ? ' : '+self(exp.alternate) : '')
           : ''
        )+')'; // TODO: smarter parens

    // Function calls
    case 'CallExpression':
      // TODO: this is the culprit for the need for Identifier checks in translateLib
      // e.g. this can send anyFunctionCall(42) to translateLib (and it shouldn't),
      // it should handle plain function calls' lookup in place
      return self(translateLib(exp.callee, exp));

    // Return statements
    case 'ReturnStatement':
      let prefix = '';

      // Are we inside game.loop()? If so, prepend
      let epath
      if (epath = AST.findAncestor(exp,
        e => e.type === 'ExpressionStatement'
          && e.expression.type === 'CallExpression'
          && e.expression.callee.type === 'MemberExpression'
          && e.expression.callee.object.name === self.game.alias
          && e.expression.callee.property.name === 'loop'
      )) {
        self.game.debug(`Found early return in loop(), prepended .display() call: ${AST.log(exp)}`);
        prefix = self.game.target+'.display(); ';
      }
      return prefix +'return' + (exp.argument ? ' '+self(exp.argument) : '') + ';';

    // Break statement
    case 'BreakStatement':
      return 'break;';


    // Assignment and binary expressions work pretty much unchanged across JS/C
    case 'LogicalExpression': // TODO: parens?
    case 'BinaryExpression': // TODO: parens!
    case 'AssignmentExpression':
      let op = exp.operator

      // Handle triple-equals
      if (op === '===') op = '==';

      // Special handling required for some game.* objects
      if (exp.type == 'AssignmentExpression'
        && exp.left.type == "MemberExpression"
      ) {
        const r = translateLib(exp);

        // Only finish early if we have received a transform result
        if (r !== undefined) {
          // Make sure we handle Error objects
          return self(r);
        }
      }

      let parens = false;

      // TODO: http://en.cppreference.com/w/c/language/operator_precedence

      // Add parentesis for binary +/- operators
      if (exp.type === 'BinaryExpression' && (op === '+' || op === '-')) {
        if (callexp // only embedded expressions need parens
            && callexp.operator !== '=' // no parens needed on assignment RHS
        ) {
          parens = true;
        }
      }

      // Add parentesis for bitwise <</>> operators
      if (exp.type === 'BinaryExpression' && (op === '<<' || op === '>>')) {
        parens = true;
      }

      // Add parentesis for compund assignment operators /=,*=
      if (exp.type === 'AssignmentExpression' && (op === '/=' || op === '*=')) {
        parens = true;
      }

      return (
        (parens ? '(' : '')
        + self(exp.left, exp)
        + ' ' + op + ' '
        + self(exp.right, exp)
        + (parens?')':'')
      );

    // Unary expression (pre + postfix) work mostly the same
    // TODO: boolean tricks? (!something >>> 1-something)
    case 'UpdateExpression':
    case 'UnaryExpression':
      return (exp.prefix
        ? exp.operator + self(exp.argument)
        : self(exp.argument) + exp.operator
      );

    // Yield has a special meaning in microcanvas
    // (acts as a terminator of a generator-function frame)
    case 'YieldExpression':
      translate.game.generators = true; // enable feature
      return '_microcanvas_yield('+getString(exp.argument)+')';
  }

  // Unrecognized
  return self(translate.game.error(`[!] Unrecognized: "${exp.type}" node at: ${AST.log(exp)}`))
}


// Translates all function call arguments (or optionally, array
// initializer elements) and returns the result, enclosed in
// the correct brackets.
function translateArgs(args, array = false) {
  return (array ? '[' : '(')
    +(args.length
      ? ' '+args.map(arg => translate(arg)).join(', ')+' '
      : ''
    )
  +(array ? ']' : ')');

}



translate.args = translateArgs;
translate.arrs = (args) => translateArgs(args, true);
translate.lookup = lookup
module.exports = translate;
