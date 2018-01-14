#include <SPI.h>
#include <EEPROM.h>

#include <avr/pgmspace.h>

#include <Arduboy.h>

Arduboy arduboy;

// frame counter, 2-byte unsigned int, max 65536
unsigned int _microcanvas_frame_counter = 0;

// sprintf() textbuffer for drawText
char _microcanvas_textbuffer[32];

// global state machine
unsigned int _microcanvas_state;

PROGMEM const unsigned char gfx_sprite_a[] = {
  /*1x1*/ 0x01 };
PROGMEM const unsigned char gfx_sprite_b[] = {
  /*1x1*/ 0x01 };
PROGMEM const unsigned char gfx_sprite_multi[] = {
  /*2x1x2*/ 0x00, 0x01, 0x01, 0x00 };


const byte GFX_SPRITE_A_WIDTH = 1;
const byte GFX_SPRITE_A_HEIGHT = 1;
const byte GFX_SPRITE_A_FRAMES = 0;
const byte GFX_SPRITE_A_FRAMESIZE = 1;
const byte GFX_SPRITE_B_WIDTH = 1;
const byte GFX_SPRITE_B_HEIGHT = 1;
const byte GFX_SPRITE_B_FRAMES = 0;
const byte GFX_SPRITE_B_FRAMESIZE = 1;
const byte GFX_SPRITE_MULTI_WIDTH = 2;
const byte GFX_SPRITE_MULTI_HEIGHT = 1;
const byte GFX_SPRITE_MULTI_FRAMES = 2;
const byte GFX_SPRITE_MULTI_FRAMESIZE = 2;

int variable = 1142;


void setup() {
  _microcanvas_frame_counter = 0;

  // cpuLoad() will only be 0 right after boot
  if (!arduboy.cpuLoad()) arduboy.begin();

////// CUSTOM SETUP //////

}

void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.clear();
arduboy.drawBitmap( 0, 0, gfx_sprite_a, GFX_SPRITE_A_WIDTH, GFX_SPRITE_A_HEIGHT, WHITE );
arduboy.drawBitmap( 0, 0, gfx_sprite_multi + GFX_SPRITE_MULTI_FRAMESIZE*(1), GFX_SPRITE_MULTI_WIDTH, GFX_SPRITE_MULTI_HEIGHT, WHITE );
arduboy.drawBitmap( 0, 0, gfx_sprite_multi + GFX_SPRITE_MULTI_FRAMESIZE*((true ? 0 : 1)), GFX_SPRITE_MULTI_WIDTH, GFX_SPRITE_MULTI_HEIGHT, WHITE );
arduboy.drawBitmap( 0, 0, (true ? gfx_sprite_a : gfx_sprite_b), (true ? GFX_SPRITE_A_WIDTH : GFX_SPRITE_B_WIDTH), (true ? GFX_SPRITE_A_HEIGHT : GFX_SPRITE_B_HEIGHT), WHITE );
arduboy.drawBitmap( 0, 0, (variable / 60 % 2 ? gfx_sprite_a : gfx_sprite_multi + GFX_SPRITE_MULTI_FRAMESIZE*(1)), (variable / 60 % 2 ? GFX_SPRITE_A_WIDTH : GFX_SPRITE_MULTI_WIDTH), (variable / 60 % 2 ? GFX_SPRITE_A_HEIGHT : GFX_SPRITE_MULTI_HEIGHT), WHITE );
arduboy.drawBitmap( 0, 0, (variable / 60 % 2 ? gfx_sprite_a : gfx_sprite_multi + GFX_SPRITE_MULTI_FRAMESIZE*(1)), (variable / 60 % 2 ? GFX_SPRITE_A_WIDTH : GFX_SPRITE_MULTI_WIDTH), (variable / 60 % 2 ? GFX_SPRITE_A_HEIGHT : GFX_SPRITE_MULTI_HEIGHT), BLACK );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
