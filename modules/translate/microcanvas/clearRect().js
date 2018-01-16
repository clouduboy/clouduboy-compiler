// game.clearRect(x, y, w, h);   >>>    <target>.fillRect(x, y, w, h, BLACK);

/**
@validhtml5
(`void`) Clear a rectangular area on the display.

Clears a rectangular area on the screen. In the browser canvas this means
actually clearing pixels (setting them transparent) on the canvas and will
result in the (black) canvas background to see through. On native targets
this will set the affected display pixels to the "background color", in
this case, `BLACK`.

Target output is exactly the same as `@fillRect`, but with the last argument
changed to BLACK.
*/

// We are not re-implementing fillRect, but instead we will just
// manipulate its output slightly
const alias = require(`./fillRect()`);

module.exports = (context) => {
  const r = alias(context)

  r.args.pop() // remove last argument
  r.args.push('BLACK') // replace it with 'BLACK'

  return r
}
