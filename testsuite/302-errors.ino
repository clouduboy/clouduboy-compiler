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
int loop_obj = /* [!] Objects are currently not supported: { foo: "bar" } */;
int[] my_date = /* [!] Objects are currently not supported: new Date() */;
int now;
int[] loop_arr = /* [!] Unrecognized expression "ArrayExpression" in: [ 1, 2, 3 ] */;
if (false) { arduboy.display(); return; }
if (arduboy.pressed( ? )) ;
/* [!] Unsupported: game.notAValidMethod */;
/* [!] Unsupported: game.notReallyAThing = 42 */;
arduboy.drawBitmap( ?, ?, return_sprite( 2 ), /* [!] Unrecognized expression "/* [!] Unsupported sprite object: returnSprite() */" in: "</* [!] Unsupported sprite object: returnSprite() */>" */, /* [!] Unrecognized expression "/* [!] Unsupported sprite object: returnSprite() */" in: "</* [!] Unsupported sprite object: returnSprite() */>" */, WHITE );
arduboy.drawBitmap( 0, 0, gfx_sprite_2, /* [!] Constant "gfxSprite2Width" not found at: gfxSprite2.width */, /* [!] Constant "gfxSprite2Height" not found at: gfxSprite2.height */, WHITE );
{
arduboy.setTextSize( 1 );
arduboy.setCursor( WIDTH / 3, 10 );
arduboy.print( "BOO!" );
};
{
arduboy.setTextSize( 1 );
arduboy.setCursor( 32, 42 );
arduboy.print( "22" );
};
/* [!] Error: text drawing functions only support strings & template literals! Near: game.fillText(WIDTH/2,HEIGHT/2, 42) */;
{
arduboy.setTextSize( 1 );
arduboy.setCursor( WIDTH / 2, HEIGHT / 2 );
arduboy.print( "42" );
};
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

