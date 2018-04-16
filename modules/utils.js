'use strict';

// Enumerate parent nodes (returns an array of elements leaf => root)
function walkParents(node) {
  let ret = [];

  while (node) {
    ret.unshift(node);
    node = node.$parent;
  }

  return ret;
}

function toSnakeCase(s) {
  return s.replace(/[A-Z0-9]/g, e => '_'+e.toLowerCase() );
}

function toConstCase(s) {
  // Already in const case
  if (s.match(/^[A-Z0-9_]+$/)) return s;

  return toSnakeCase(s).toUpperCase();
}



module.exports = {
  walkParents: walkParents,
  toSnakeCase: toSnakeCase,
  toConstCase: toConstCase
}
