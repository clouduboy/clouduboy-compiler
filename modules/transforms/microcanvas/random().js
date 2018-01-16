// game.random(0, 10);   >>>   random(0, 10);

/**
(`number`) Generate random integers in specified range.

This convenience function replicates the behavior of
[Arduino's `random(min, max)`](https://www.arduino.cc/reference/en/language/functions/random-numbers/random/)
function, where `min` is optional and specifies the lower bound of the
generated values (and is inclusive), while `max` specifies the upper
bound and is exclusive.
This means `random(6)` will generate numbers between 0-5, while
`random(1,7)` will generate numbers between 1-6
*/
// TODO: Explore if a more literal (inclusive ranges) random
// function would be more useful/less confusing here
// (but then it has to map well to the compiled version)


module.exports = (context) => {
  const {translate, callexp} = context

  // simple 1:1 mapping to the global function
  return ({
    call: 'random',
    args: callexp.arguments
  })
}
