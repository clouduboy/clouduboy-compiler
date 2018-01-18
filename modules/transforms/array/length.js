// myArray.length => LENGTHOF(my_array)

/*
@valides5
(`number`) Returns the length of the referenced array.

*/

module.exports = (context) => {
  const {translate, exp} = context

  // simple mapping to a global function
  return ({
    call: 'LENGTHOF',
    args: [ exp.object ]
  })
}
