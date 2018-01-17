'use strict';



// Returns the simple string representation of the AST node
// (basically "recreates" the item as it (might) have appeared
// in the source - although this is not a faithful representation
// to the original source (yet), e.g. parens stripped, etc.)
// TODO: move this fully to ast.js
function getString(exp) {
  if (typeof exp === 'string') return exp;

  if (!exp || !exp.type ) return '<"'+String(exp)+'>"';

  let self = getString;

  switch (exp.type) {
    case 'Identifier':
      return exp.name;

    case 'Literal':
      return exp.value;

    case 'TemplateLiteral':
      return (exp.quasis.map(q => q.value.raw).join())

    case 'MemberExpression':
      // Property expression
      if (exp.computed) {
        return (self(exp.object) + '[ ' + self(exp.property)) +' ]';
      }

      // Simple property access
      return (self(exp.object) + '.' + self(exp.property));

    case 'NewExpression':
    case 'CallExpression':
      return `${exp.type === 'NewExpression' ? 'new ' :''}${self(exp.callee)}()`;

    case 'ExpressionStatement':
      return self(exp.expression);

    case 'BinaryExpression':
    case 'AssignmentExpression':
      return self(exp.left) +' '+exp.operator+' '+ self(exp.right);

    default:
      return '"<'+exp.type+'>"';
  }
}



module.exports = getString;
