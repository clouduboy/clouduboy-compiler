// game.fillRect(x, y, w, h);    >>>    <target>.fillRect(x, y, w, h);

/**
@validhtml5
(`void`) Fills a rectangular area on the display.


*/


module.exports = (context) => {
  const {translate, callexp} = context
  const sA = callexp.arguments;

  // simple 1:1 mapping
  return ({
    call: '<target>.fillRect',
    args: [
      sA[0], sA[1], // x, y
      sA[2], sA[3], // w, h
      'WHITE' // fill color
      // TODO: this assumes Arduboy, check target
    ]
  })
}
