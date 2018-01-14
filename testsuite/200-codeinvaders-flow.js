"use strict";

let game: MicroCanvas = new MicroCanvas();

let gfxInvader: {frames: ?number, height: number, width: number}, gfxInvader2: {frames: ?number, height: number, width: number}, gfxDefender: {frames: ?number, height: number, width: number};

game.setup(function() : void{
  gfxInvader = game.loadSprite(
    `PROGMEM const unsigned char invader[] = { /*9x6*/ 0x38, 0x1c, 0x35, 0x1e, 0x3c, 0x1e, 0x35, 0x1c, 0x38 }`
  );
  gfxInvader2 = game.loadSprite(
    `PROGMEM const unsigned char invader2[] = { /*9x6*/ 0x18, 0x3c, 0x15, 0x3e, 0x1c, 0x3e, 0x15, 0x3c, 0x18 }`
  );
  //let invader = new Image();
  //invader.src="https://happycodefriends.github.io/code-invaders/invader.png";
  //invader.onload=function(){ invader.loaded = true };

  gfxDefender = game.loadSprite(
    `PROGMEM const unsigned char defender[] = {
      /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38
    }`
  );
  //let turret = new Image();
  //turret.src="https://happycodefriends.github.io/code-invaders/turret.png";
  //turret.onload=function(){ turret.loaded = true };

});



let rocketX: number;
let rocketY: number = 0;

let gameareaSize: number = 64;
let turretPosition: number = gameareaSize/2;


game.loop(function() : void{

  // Clear display, redraw background text
  game.clear();


  // Handle keypresses
  if (game.buttonPressed('left')) turretPosition = turretPosition-3;
  if (turretPosition<0) turretPosition = 0;

  if (game.buttonPressed('right')) turretPosition = turretPosition+3;
  if (turretPosition>gameareaSize-gfxDefender.width/2) turretPosition = gameareaSize-gfxDefender.width/2;

  // Update turret projectile
  if (rocketY <= 0) {
    if (game.buttonPressed('space')) {
      rocketY = gameareaSize - 3;
      rocketX = turretPosition - 1;
    }
  }

  if (rocketY > 0) {
    rocketY = rocketY -3;
  }


  // Draw the game
  draw();

});


function draw() : void{
  game.clear()

  let y: number = 0;
  while (y < 4) {

   let x: number = 0;
   while (x < 5) {

// TODO: bugfix this
//     if (y % 2)
//       game.drawImage(gfxInvader, 13*x+Math.abs(game.frameCount%30/5-3), 9*y);
//     else
///      game.drawImage(gfxInvader, 13*x+4-Math.abs(game.frameCount%30/5-3), 9*y);
    let d: number = game.frameCount%60<30 ? (game.frameCount%60/10|0) : (3 - (game.frameCount%60/10|0));

    game.drawImage((game.frameCount/10|0)%2 ? gfxInvader : gfxInvader2, 13*x +(y%2 ? d : 3-d) +3, 9*y);

     x = x + 1;
   }
   y = y + 1;
  }

  game.drawText( `${(game.frameCount%30/5|0) - 3}`, 100,0);

  game.drawImage(gfxDefender , turretPosition-5, gameareaSize-8);

  if (game.buttonPressed('left')) game.drawText('<', 0, gameareaSize-7);
  if (game.buttonPressed('right')) game.drawText('>', gameareaSize-10, gameareaSize-7);

  if (rocketY > 0) {
    game.fillRect(rocketX, rocketY, 1,2);
  }
}


console.log("MicroCanvas initialized");
