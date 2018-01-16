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




int arr_1[] = { 1, 2, 3, 4, 5 };
int arr_2[ 10 ];

int test_function(int value) {
////// FUNCTION BODY //////
return value * 2;

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
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( arr1 ); ++_a_fill_idx_) arr1[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( arr2 ); ++_a_fill_idx_) arr2[_a_fill_idx_] = 1 + 2;
arr1[ 1 ] = 10;
int val = arr2[ 1 + 5 ];
int fromarr = arr1[ val - 1 ];
arr2[ 0 ] = test_function( arr1[ 1 ] );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

