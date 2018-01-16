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

PROGMEM const unsigned char gfx_invader[] = {
  /*9x8x2*/ 0x70, 0x38, 0xea, 0x3c, 0x78, 0x3c, 0xea, 0x38, 0x70, 0x70, 0x38, 0x6a, 0xbc, 0x38, 0xbc, 0x6a, 0x38, 0x70 };
PROGMEM const unsigned char gfx_defender[] = {
  /*9x6*/ 0x38, 0x30, 0x3c, 0x2e, 0x27, 0x2e, 0x3c, 0x30, 0x38 };
PROGMEM const unsigned char gfx_invader_2[] = {
  /*9x8*/ 0x28, 0x10, 0xba, 0x6a, 0x3f, 0x6a, 0xba, 0x10, 0x28 };
PROGMEM const unsigned char gfx_rocket[] = {
  /*1x3*/ 0x07 };
PROGMEM const unsigned char gfx_bomb[] = {
  /*5x5x2*/ 0x08, 0x1a, 0x1c, 0x1a, 0x08, 0x08, 0x18, 0x1e, 0x18, 0x08 };


const int INVADER_WAVES = 4;
const int INVADER_ALIENS = 8;
const int DEFENDER_WIN_ANIMATION_DURATION = 60;
const int GAME_TIMER_ANIMATION_DURATION = 60 * 1 + 60 * 24;
const byte GFX_INVADER_WIDTH = 9;
const byte GFX_INVADER_HEIGHT = 8;
const byte GFX_INVADER_FRAMES = 2;
const byte GFX_INVADER_FRAMESIZE = 9;
const byte GFX_INVADER_2_WIDTH = 9;
const byte GFX_INVADER_2_HEIGHT = 8;
const byte GFX_INVADER_2_FRAMES = 0;
const byte GFX_INVADER_2_FRAMESIZE = 9;
const byte GFX_DEFENDER_WIDTH = 9;
const byte GFX_DEFENDER_HEIGHT = 6;
const byte GFX_DEFENDER_FRAMES = 0;
const byte GFX_DEFENDER_FRAMESIZE = 9;
const byte GFX_ROCKET_WIDTH = 1;
const byte GFX_ROCKET_HEIGHT = 3;
const byte GFX_ROCKET_FRAMES = 0;
const byte GFX_ROCKET_FRAMESIZE = 1;
const byte GFX_BOMB_WIDTH = 5;
const byte GFX_BOMB_HEIGHT = 5;
const byte GFX_BOMB_FRAMES = 2;
const byte GFX_BOMB_FRAMESIZE = 5;

int rocket_x;
int rocket_y;
int turret_x;
int invaders[ INVADER_ALIENS * INVADER_WAVES ];
int total_invaders;
int game_over;
int defeat_after = 0;
int defender_win_animation_start = 0;
int game_timer_animation_start = 0;

// t: current time, b: beginning value, c: change in value, d: duration
int ease_cubic_in(int x, int t, int b, int c, int d) {
  float td= (float)t/(float)d;
  return (int)(c * td*td*td + b +.5);
}

boolean collides(
  const unsigned char* s1, int x1,int y1, int s1_width, int s1_height,
  const unsigned char* s2, int x2,int y2, int s2_width, int s2_height,
  boolean precise
) {
  boolean result = false;

  // Basic collision rectangle
  int cx = x1>x2 ? x1 : x2;
  int cw = x1>x2 ? x2+s2_width-x1 : x1+s1_width-x2;

  int cy = y1>y2 ? y1 : y2;
  int ch = y1>y2 ? y2+s2_height-y1 : y1+s1_height-y2;

  if (cw>0 && ch>0) {
    result = true;
  }

  // No bounding rect collision or no precise check requested
  if (!precise || !result) {
    return result;
  }

  // TODO: pixel-by-pixel collision test

  return result;
}

void defeat() {
////// FUNCTION BODY //////
arduboy.drawBitmap( WIDTH / 2 - GFX_INVADER_WIDTH / 2, HEIGHT / 2 - GFX_INVADER_HEIGHT * 2, gfx_invader + GFX_INVADER_FRAMESIZE*(_microcanvas_frame_counter / 15 & 1), GFX_INVADER_WIDTH, GFX_INVADER_HEIGHT, WHITE );
_microcanvas_fill_color = WHITE;
{
arduboy.setTextSize( 1 );
arduboy.setCursor( WIDTH / 2 - strlen(" OH NO!") * 6 / 2, HEIGHT / 2 );
arduboy.print( " OH NO!" );
};
if (defeat_after == 0) defeat_after = _microcanvas_frame_counter;
if (defeat_after > 0 && (_microcanvas_frame_counter - defeat_after) > 3 * 60) {
  _microcanvas_fill_color = WHITE;
  {
arduboy.setTextSize( 1 );
arduboy.setCursor( WIDTH / 2 - strlen("SPACE to try again") * 6 / 2, HEIGHT / 4 * 3 );
arduboy.print( "SPACE to try again" );
};
  if (arduboy.pressed( A_BUTTON )) {
  defeat_after = 0;
  setup();
}
}

}
void victory() {
////// FUNCTION BODY //////
if (!defender_win_animation_start) defender_win_animation_start = _microcanvas_frame_counter;
if (defender_win_animation_remaining() > 0) {
  int turret_y = defender_win_animation();
  arduboy.drawBitmap( turret_x - 5, turret_y, gfx_defender, GFX_DEFENDER_WIDTH, GFX_DEFENDER_HEIGHT, WHITE );
}
_microcanvas_fill_color = WHITE;
{
arduboy.setTextSize( 1 );
arduboy.setCursor( WIDTH / 2 - strlen(" HUMANITY PREVAILS!") * 6 / 2, HEIGHT / 2 );
arduboy.print( " HUMANITY PREVAILS!" );
};

}
int playgame() {
////// FUNCTION BODY //////
arduboy.clear();
int invasion = game_timer_animation();
int invader_x = invader_animation();
int start_x = (WIDTH - (INVADER_ALIENS * (GFX_INVADER_WIDTH + 4) - 4)) / 2;
int y = 0;
while (y < INVADER_WAVES) {
  int x = 0;
  while (x < INVADER_ALIENS) {
  if (invaders[ x + INVADER_ALIENS * y ]) {
  int d_y = invasion + y * (GFX_INVADER_HEIGHT + 1);
  if ((d_y + GFX_INVADER_HEIGHT) >= (HEIGHT - GFX_DEFENDER_HEIGHT)) {
  game_over = true;
  return;
}
  if (y % 2) {
  arduboy.drawBitmap( (start_x + (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4), d_y, gfx_invader + GFX_INVADER_FRAMESIZE*((invader_x >> 1) & 1), GFX_INVADER_WIDTH, GFX_INVADER_HEIGHT, WHITE );
  if (rocket_y >= 3 && collides( gfx_invader + GFX_INVADER_FRAMESIZE*((invader_x >> 1) & 1), (start_x + (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4), d_y, GFX_INVADER_WIDTH, GFX_INVADER_HEIGHT, gfx_rocket, rocket_x, rocket_y, GFX_ROCKET_WIDTH, GFX_ROCKET_HEIGHT, "false" )) {
  invaders[ x + INVADER_ALIENS * y ] = 0;
  total_invaders--;
  rocket_y = 0;
}
} else {
  arduboy.drawBitmap( (start_x - (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4), d_y, gfx_invader_2, GFX_INVADER_2_WIDTH, GFX_INVADER_2_HEIGHT, WHITE );
  if (rocket_y >= 3 && collides( gfx_invader_2, (start_x - (invader_x - 3)) + x * (GFX_INVADER_WIDTH + 4), d_y, GFX_INVADER_2_WIDTH, GFX_INVADER_2_HEIGHT, gfx_rocket, rocket_x, rocket_y, GFX_ROCKET_WIDTH, GFX_ROCKET_HEIGHT, "false" )) {
  invaders[ x + 8 * y ] = 0;
  total_invaders--;
  rocket_y = 0;
}
}
}
  x = x + 1;
}
  y = y + 1;
}
arduboy.drawBitmap( turret_x - 5, HEIGHT - GFX_DEFENDER_HEIGHT, gfx_defender, GFX_DEFENDER_WIDTH, GFX_DEFENDER_HEIGHT, WHITE );
if (rocket_y >= 3) {
  arduboy.fillRect( rocket_x, rocket_y, 1, 2, WHITE );
}
arduboy.fillRect( WIDTH / 2 - 7, 0, 13, 9, BLACK );
_microcanvas_fill_color = WHITE;
{
arduboy.setTextSize( 1 );
arduboy.setCursor( WIDTH / 2 - strlen(_microcanvas_textbuffer) * 6 / 2, 0 );
sprintf( _microcanvas_textbuffer, "%u", (int)floor( game_timer_animation_remaining() / 60 ) );
arduboy.print( _microcanvas_textbuffer );
};

}
int invader_animation() {
////// FUNCTION BODY //////
int t = _microcanvas_frame_counter % 120;
int x;
if (t < 60) {
  x = (0 + ((6 - 0) * (t - 0) * 10 / 60 + 5) / 10) | 0;
} else {
  x = (6 + ((0 - 6) * (t - 60) * 10 / 60 + 5) / 10) | 0;
}
return x;

}
int defender_win_animation() {
////// FUNCTION BODY //////
int t = min( _microcanvas_frame_counter - defender_win_animation_start, DEFENDER_WIN_ANIMATION_DURATION );
int x = (ease_cubic_in( 0, t, 10 * (HEIGHT - GFX_DEFENDER_HEIGHT), -10 * (HEIGHT - GFX_DEFENDER_HEIGHT), DEFENDER_WIN_ANIMATION_DURATION ) + 5) / 10 | 0;
return x;

}
int defender_win_animation_remaining() {
////// FUNCTION BODY //////
return 60 - (_microcanvas_frame_counter - defender_win_animation_start);

}
int game_timer_animation() {
////// FUNCTION BODY //////
int t = min( _microcanvas_frame_counter - game_timer_animation_start, GAME_TIMER_ANIMATION_DURATION );
int duration_1 = 60 * 1; int duration_2 = 60 * 24;
int x;
if (t < duration_1) {
  x = (ease_cubic_in( 0, t, 10 * 0, 10 * 0, duration_1 ) + 5) / 10 | 0;
} else {
  x = (ease_cubic_in( 0, t - duration_1, 10 * 0, 10 * (((HEIGHT - GFX_DEFENDER_HEIGHT) - GFX_INVADER_HEIGHT) + 1), duration_2 ) + 5) / 10 | 0;
}
return x;

}
int game_timer_animation_remaining() {
////// FUNCTION BODY //////
return max( GAME_TIMER_ANIMATION_DURATION - (_microcanvas_frame_counter - game_timer_animation_start), 0 );

}

void setup() {
  _microcanvas_frame_counter = 0;

  // cpuLoad() will only be 0 right after boot
  if (!arduboy.cpuLoad()) arduboy.begin();

////// CUSTOM SETUP //////
turret_x = WIDTH / 2;
rocket_x = 0;
rocket_y = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( invaders ); ++_a_fill_idx_) invaders[_a_fill_idx_] = 1;
total_invaders = LENGTHOF( invaders );
game_over = false;
defender_win_animation_start = 0;
game_timer_animation_start = 0;
}

void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.clear();
if (rocket_y < 3) {
  if (total_invaders > 0 && arduboy.pressed( A_BUTTON )) {
  rocket_y = HEIGHT - 3;
  rocket_x = turret_x - 1;
}
}
if (rocket_y >= 3) {
  rocket_y = rocket_y - 3;
}
if (total_invaders > 0 && !game_over) {
  if (arduboy.pressed( LEFT_BUTTON )) {
  turret_x = turret_x - 3;
}
  if (arduboy.pressed( RIGHT_BUTTON )) {
  turret_x = turret_x + 3;
}
  if (turret_x < (GFX_DEFENDER_WIDTH / 2 + 1)) {
  turret_x = GFX_DEFENDER_WIDTH / 2 + 1;
}
  if (turret_x > (WIDTH - GFX_DEFENDER_WIDTH / 2)) {
  turret_x = WIDTH - GFX_DEFENDER_WIDTH / 2;
}
  playgame();
} else {
  if (game_over) {
  defeat();
} else {
  victory();
}
}
////// END OF LOOP CONTENTS //////

  arduboy.display();
}

