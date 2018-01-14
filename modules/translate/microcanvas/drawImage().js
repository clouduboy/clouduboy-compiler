// `Microcanvas.drawImage(sprite, x, y)` method
// translate.game.drawImage(gfx,x,y);   >>>    arduboy.drawBitmap(x,y, gfx, GFX_WIDTH,GFX_HEIGHT, WHITE);
const getString = require('../../getString.js');

module.exports = (context) => {
  const {translate, callexp} = context;

  let sA = callexp.arguments;
  let argW, argH;

  if (sA[0] && sA[0].type) {
    let gfx;

    switch (sA[0].type) {
      // drawImage( gfxFoo, ... )
      case 'Identifier':
        gfx = getString(sA[0]);
        argW = { type: 'MemberExpression', object: gfx, property: { type: 'Identifier', name:'width' }};
        argH = { type: 'MemberExpression', object: gfx, property: { type: 'Identifier', name:'height' }};
        break;

      // drawImage( gfxSprite[i] )
      case 'MemberExpression':
        gfx = getString(sA[0].object);
        argW = { type: 'MemberExpression', object: gfx, property: { type: 'Identifier', name:'width' }};
        argH = { type: 'MemberExpression', object: gfx, property: { type: 'Identifier', name:'height' }};
        break;

      // drawImage( true ? gfxA : gfxB )
      case 'ConditionalExpression':
        let gfxC = getString(sA[0].consequent),
            gfxA = getString(sA[0].alternate);

        argW = { type: 'ConditionalExpression',
                 test: sA[0].test,
                 consequent: { type: 'MemberExpression', object: gfxC, property: { type: 'Identifier', name:'width' }},
                 alternate: { type: 'MemberExpression', object: gfxA, property: { type: 'Identifier', name:'width' }}
               };
        argH = { type: 'ConditionalExpression',
                 test: sA[0].test,
                 consequent: { type: 'MemberExpression', object: gfxC, property: { type: 'Identifier', name:'height' }},
                 alternate: { type: 'MemberExpression', object: gfxA, property: { type: 'Identifier', name:'height' }}
               };
        break;

      // Unsupported
      default:
        argW = { type: '__translateLib('+sA[0].type+')', object: sA[0], property: { type: 'Identifier', name:'width' }};
        argH = { type: '__translateLib('+sA[0].type+')', object: sA[0], property: { type: 'Identifier', name:'height' }};
    }

  } else {
    argW = { type: 'MemberExpression', object: sA[0], property: { type: 'Identifier', name:'width' }};
    argH = { type: 'MemberExpression', object: sA[0], property: { type: 'Identifier', name:'height' }};
  }

  let targetArgs = [
    sA[1], sA[2], sA[0],
    argW, argH,
    'WHITE'
  ];

  return ({
    call: translate.game.target+'.drawBitmap',
    args: targetArgs
  });

  // todo subframe slice version
};
