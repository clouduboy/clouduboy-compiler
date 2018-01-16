// game.eraseImage(gfx, x, y);   >>>    <target>.drawBitmap(x ,y, gfx, GFX_WIDTH, GFX_HEIGHT, BLACK);

/**
@deprecated
(`void`) Erases the pixels of an image from the screen

This is an alias for `@clearImage()`, and its use is deprecated, the
use of `@clearImage()` is preferred.
*/

const alias = require(`./clearImage()`)

module.exports = (context) => alias(context)
