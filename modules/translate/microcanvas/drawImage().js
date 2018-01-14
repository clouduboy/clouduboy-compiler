// `Microcanvas.drawImage(sprite, x, y)` method
// translate.game.drawImage(gfx,x,y);   >>>    arduboy.drawBitmap(x,y, gfx, GFX_WIDTH,GFX_HEIGHT, WHITE);
const { AST } = require('../../ast.js');

module.exports = (context) => {
  const {translate, callexp} = context;

  let sA = callexp.arguments;
  let argW, argH;

  if (sA[0] && sA[0].type) {
    let gfx;

    switch (sA[0].type) {
      // drawImage( gfxFoo, ... )
      case 'Identifier':
        argW = AST.MemberExpression(sA[0], AST.Identifier('width'));
        argH = AST.MemberExpression(sA[0], AST.Identifier('height'));
        break;

      // drawImage( gfxSprite[i] )
      case 'MemberExpression':
        argW = AST.MemberExpression(sA[0].object, AST.Identifier('width'));
        argH = AST.MemberExpression(sA[0].object, AST.Identifier('height'));
        break;

      // drawImage( true ? gfxA : gfxB )
      case 'ConditionalExpression':
        argW = AST.ConditionalExpression(
          sA[0].test,
          AST.MemberExpression(sA[0].consequent, AST.Identifier('width')),
          AST.MemberExpression(sA[0].alternate,  AST.Identifier('width'))
        );
        argH = AST.ConditionalExpression(
          sA[0].test,
          AST.MemberExpression(sA[0].consequent, AST.Identifier('height')),
          AST.MemberExpression(sA[0].alternate,  AST.Identifier('height'))
        );
        break;

      // Unsupported
      default:
        argW = { type: '__translateDrawImage('+sA[0].type+')', object: sA[0], property: { type: 'Identifier', name:'width' }};
        argH = { type: '__translateDrawImage('+sA[0].type+')', object: sA[0], property: { type: 'Identifier', name:'height' }};
    }

  } else {
    argW = AST.MemberExpression(sA[0], AST.Identifier('width'));
    argH = AST.MemberExpression(sA[0], AST.Identifier('height'));
  }

  let targetArgs = [
    sA[1], sA[2], // x, y
    sA[0],        // sprite
    argW, argH,   // width, height
    'WHITE'       // fill color, TODO: only for Arduboy (do target check)
  ];

  return ({
    call: translate.game.target+'.drawBitmap',
    args: targetArgs
  });

  // todo subframe slice version
};
