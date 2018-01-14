// translate.game.eraseImage(gfx,x,y);   >>>    arduboy.drawBitmap(x,y, gfx, GFX_WIDTH,GFX_HEIGHT, BLACK);

// The `MicroCanvas.eraseImage(sprite, x, y)`
// method is an alias for
// `MicroCanvas.clearImage(sprite, x, y)`
const alias = require(`./clearImage()`);

module.exports = (context) => alias(context);
