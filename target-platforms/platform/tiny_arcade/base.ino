#include <TinyScreen.h>
#include <SPI.h>
#include <Wire.h>

#include <TinyArcade.h>


////// TARGET-SPECIFIC SETUP: TINY_ARCADE //////
#define screenWidth ${targetPlatform.screen.width}
#define screenHeight ${targetPlatform.screen.height}

// this is the canonical (arduboy lib) usage
#define WIDTH screenWidth
#define HEIGHT screenHeight

#define BLACK 1
#define WHITE 0

#define LEFT_BUTTON 1
#define RIGHT_BUTTON 2
#define A_BUTTON 3
#define B_BUTTON 3

// Currently used color bitdepth (1 - 8 bit, 2 - 16 bit)
#define BIT_DEPTH 2

// 16bit screenbuffer
uint8_t buffer[WIDTH * HEIGHT * BIT_DEPTH];

TinyScreen _display = TinyScreen(TinyScreenPlus);



// frame counter, 2-byte unsigned int, max 65536
unsigned int _microcanvas_frame_counter = 0;

// sprintf() textbuffer for drawText
char _microcanvas_textbuffer[32];

// global state machine
unsigned int _microcanvas_state;

// global current drawing color
unsigned int _microcanvas_fill_color = WHITE;
