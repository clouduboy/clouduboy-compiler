'use strict'

module.exports = isCalling


function isCalling(exp, id) {
  if (exp.type === 'CallExpression') {
    // looking for a MemberExpression
    if (id.indexOf('.')) {
      let mexp = id.split('.')
      if (exp.callee.type === 'MemberExpression') {
        return (
          exp.callee.object.name === mexp[0]
          &&
          exp.callee.property.name === mexp[1]
        )
      } else {
        console.warn('Expecting call to a MemberExpression `'+id+'(…)`, but found: '+exp.right.type)
      }

    // Other call
    } else {
      console.warn('Unrecognized call expression format: '+id)
    }
  } else {
    console.warn('Expecting CallExpression `'+id+'(…)`, but found: '+exp.type)
  }

  return false
}
