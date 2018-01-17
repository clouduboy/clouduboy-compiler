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

// global current drawing color
_microcanvas_fill_color = WHITE;

PROGMEM const unsigned char gfx_bats[] = {
  /*16x6x2*/ 0x01, 0x0f, 0x0e, 0x1c, 0x38, 0x3c, 0x1b, 0x3e, 0x3e, 0x1b, 0x3c, 0x38, 0x1c, 0x0e, 0x0f, 0x01, 0x1c, 0x0e, 0x0c, 0x07, 0x0e, 0x0c, 0x1b, 0x3e, 0x3e, 0x1b, 0x0c, 0x0e, 0x07, 0x0c, 0x0e, 0x1c };


const byte GFX_BATS_WIDTH = 16;
const byte GFX_BATS_HEIGHT = 6;
const byte GFX_BATS_FRAMES = 2;
const byte GFX_BATS_FRAMESIZE = 16;

int x;
int y;
int sx = 1;
int sy = 1;
int animation_speed;
int c_sprite;


void setup() {
  _microcanvas_frame_counter = 0;

  // cpuLoad() will only be 0 right after boot
  if (!arduboy.cpuLoad()) arduboy.begin();

////// CUSTOM SETUP //////
x = 0;
y = (HEIGHT - GFX_BATS_HEIGHT) / 2;
animation_speed = 8;
c_sprite = 0;
}

void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
if (arduboy.everyXFrames( animation_speed )) {
  c_sprite = 1 - c_sprite;
}
x += sx;
y += sy;
if (x >= ((WIDTH - GFX_BATS_WIDTH) - 1) || x < 1) sx = -sx;
if (y >= ((HEIGHT - GFX_BATS_HEIGHT) - 1) || y < 1) sy = -sy;
arduboy.clear();
{
arduboy.setTextSize( 3 );
arduboy.setCursor( 0, 0 );
arduboy.print( "Sprite\nDemo" );
};
arduboy.drawBitmap( 0 + x, 2 + y, gfx_bats + GFX_BATS_FRAMESIZE*(c_sprite | 0), GFX_BATS_WIDTH, GFX_BATS_HEIGHT, BLACK );
arduboy.drawBitmap( 2 + x, 2 + y, gfx_bats + GFX_BATS_FRAMESIZE*(c_sprite | 0), GFX_BATS_WIDTH, GFX_BATS_HEIGHT, BLACK );
arduboy.drawBitmap( 1 + x, 1 + y, gfx_bats + GFX_BATS_FRAMESIZE*(c_sprite | 0), GFX_BATS_WIDTH, GFX_BATS_HEIGHT, WHITE );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

