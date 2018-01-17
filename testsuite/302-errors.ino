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
unsigned int _microcanvas_fill_color = WHITE;

#define LENGTHOF(x)  (sizeof(x) / sizeof(x[0]))

PROGMEM const unsigned char gfx_sprite_1[] = {
  undefined };
PROGMEM const unsigned char gfx_sprite_2[] = {
  undefined };



int game[];
int arr_1[] = { 1, 2, 3, 4, 5 };
int arr_2[ 10 ];

int return_sprite(int sprite_number) {
////// FUNCTION BODY //////
return (sprite_number > 1 ? gfx_sprite_2 : gfx_sprite_1);

}

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
int loop_obj;
int[] my_date;
int now;
int[] loop_arr = 1,2,3;
if (arduboy.pressed( ? )) undefined
undefined;
undefined = 42;
arduboy.drawBitmap( ?, ?, return_sprite( 2 ), ?, ?, WHITE );
arduboy.drawBitmap( 0, 0, gfx_sprite_2, , , WHITE );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

