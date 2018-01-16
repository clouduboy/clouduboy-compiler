// game.everyXFrames(10);   >>>    <target>.everyXFrames(10);

/**
(`boolean`) Returns true on, and only on every X-th frame.

Function makes sure any action specified is not executed
more often than on every X frame.
*/


module.exports = (context) => {
  const {translate, callexp} = context

  // simple 1:1 mapping
  return ({
    call: '<target>.everyXFrames',
    args: callexp.arguments
  })
}
