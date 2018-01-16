// myArray.length => sizeof(my_array)

/*
@valides5
(`number`) Returns the length of the referenced array.

*/

module.exports = (context) => {
  const {translate, obj} = context

  // simple mapping to a global function
  return ({
    call: 'sizeof',
    args: [ obj ]
  })
}
