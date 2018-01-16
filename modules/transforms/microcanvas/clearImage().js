// game.clearImage(gfx, x, y);   >>>    <target>.drawBitmap(x, y, gfx, GFX_WIDTH, GFX_HEIGHT, BLACK);

/* Clear image

Clears the image on the screen (that is, unsets all display pixels of the image,
an "opposite" or "negative" of `@drawImage`). Useful for drawing object shadows on
1-bit color systems by clearing a sprite, slightly offset with a single pixel
before drawing the actual sprite.

Target output is exactly the same as drawImage, but with the last argument
(the "drawing color" for `@drawImage`) changed to `BLACK`.
*/

// We are not re-implementing drawImage, but instead we will just
// manipulate its output slightly
const alias = require(`./drawImage()`);

module.exports = (context) => {
  const r = alias(context)

  r.args.pop() // remove last argument
  r.args.push('BLACK') // replace it with 'BLACK'

  return r
}
