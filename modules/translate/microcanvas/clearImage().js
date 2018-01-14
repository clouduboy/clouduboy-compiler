// translate.game.clearImage(gfx,x,y);   >>>    arduboy.drawBitmap(x,y, gfx, GFX_WIDTH,GFX_HEIGHT, BLACK);

// Exactly the same sa drawImage, but with the last argument changed to BLACK
const alias = require(`./drawImage()`);

module.exports = (context) => {
  const r = alias(context);

  r.args.pop(); // remove last argument
  r.args.push('BLACK'); // replace it with 'BLACK'

  return r;
};
