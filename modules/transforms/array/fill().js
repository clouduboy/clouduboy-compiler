// myArray.fill(42)
// >>>
// for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF(my_array); ++_a_fill_idx_) my_array[_a_fill_idx_] = 42;

/*
@valides5
(`void`) Fills the array with the specified value.

Fills (replaces all elements) with the specified value.
*/

const { AST } = require('../../ast')


module.exports = (context) => {
  const {translate, exp, callexp} = context

  // Lookup/translate the object of the call (array name)
  let varName = translate(exp.object)

  return `for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( ${varName} ); ++_a_fill_idx_) ${varName}[_a_fill_idx_] = ${translate(callexp.arguments[0])}`
  // TODO: memset works too, but only for byte arrays, because memset converts
  // the passed-in value to an (unsigned) byte and fills up all bytes of the
  // array with that single byte. It could still be used with the value "0",
  // as for all intents and purposes that's the same across all numeric types.
  // Figure out whether we want/should we enforce default "all numeric arrays
  // are byte arrays" in Clouduboy (until we still can, re: backwards-compat)
  //return `memset(${varName}, ${translate(callexp.arguments[0])}, LENGTHOF(${varName}))`
}
