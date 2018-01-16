// game.clear();   >>>    <target>.clear();

/**
(`void`) Clear the screen

Equivalent of game.clearRect(0, 0, game.width, game.height).

[!] Note
Tricks like game.width = game.width will seemingly work, as it will
clear the Canvas as expected -- in the browser. It **will not** clear
the screen once this is compiled to any of the native targets.
(As a matter of fact, it will result in a compile error)

Also, the Clouduboy compile doesn't support changing the size of
the canvas during runtime (as, obviously, on actual hardware, the
size/resolution of the actual physical display cannot be changed
from the code).
*/

module.exports = (context) => {
  const {translate, callexp} = context

  // simple 1:1 mapping
  return ({
    call: '<target>.clear',
    args: callexp.arguments
  })
}
