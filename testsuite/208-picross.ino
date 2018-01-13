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

PROGMEM const unsigned char gfx_win[] = {
  /*20x5*/ 0x00, 0x0e, 0x10, 0x10, 0x0e, 0x00, 0x00, 0x00, 0x1e, 0x10, 0x18, 0x10, 0x1e, 0x00, 0x1e, 0x00, 0x1e, 0x04, 0x08, 0x1e };
PROGMEM const unsigned char gfx_field[] = {
  /*5x5x4*/ 0x1f, 0x01, 0x01, 0x01, 0x01, 0x1f, 0x01, 0x0d, 0x0d, 0x01, 0x1f, 0x13, 0x01, 0x01, 0x13, 0x1f, 0x13, 0x0d, 0x0d, 0x13 };
PROGMEM const unsigned char gfx_numbers[] = {
  /*5x5x9*/ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1e, 0x00, 0x00, 0x00, 0x1a, 0x12, 0x16, 0x00, 0x00, 0x12, 0x1a, 0x1e, 0x00, 0x00, 0x0e, 0x08, 0x1c, 0x00, 0x00, 0x16, 0x12, 0x1a, 0x00, 0x00, 0x1e, 0x18, 0x18, 0x00, 0x00, 0x02, 0x02, 0x1e, 0x00, 0x00, 0x1e, 0x1a, 0x1e, 0x00 };


const byte GFX_WIN_WIDTH = 20;
const byte GFX_WIN_HEIGHT = 5;
const byte GFX_WIN_FRAMES = 0;
const byte GFX_WIN_FRAMESIZE = 20;
const byte GFX_FIELD_WIDTH = 5;
const byte GFX_FIELD_HEIGHT = 5;
const byte GFX_FIELD_FRAMES = 4;
const byte GFX_FIELD_FRAMESIZE = 5;
const byte GFX_NUMBERS_WIDTH = 5;
const byte GFX_NUMBERS_HEIGHT = 5;
const byte GFX_NUMBERS_FRAMES = 9;
const byte GFX_NUMBERS_FRAMESIZE = 5;

int field_size = 8;
int sprite_size = 5;
int mark;
int mark_row;
byte row_info_0[] = { 0, 0, 0, 0 };
byte row_info_1[] = { 0, 0, 0, 0 };
byte row_info_2[] = { 0, 0, 0, 0 };
byte row_info_3[] = { 0, 0, 0, 0 };
byte row_info_4[] = { 0, 0, 0, 0 };
byte row_info_5[] = { 0, 0, 0, 0 };
byte row_info_6[] = { 0, 0, 0, 0 };
byte row_info_7[] = { 0, 0, 0, 0 };
byte board_0[] = { 0 };
byte board_1[] = { 0 };
byte board_2[] = { 0 };
byte board_3[] = { 0 };
byte board_4[] = { 0 };
byte board_5[] = { 0 };
byte board_6[] = { 0 };
byte board_7[] = { 0 };
byte column_info_0[] = { 0 };
byte column_info_1[] = { 0 };
byte column_info_2[] = { 0 };
byte column_info_3[] = { 0 };
byte column_info_4[] = { 0 };
byte column_info_5[] = { 0 };
byte column_info_6[] = { 0 };
byte column_info_7[] = { 0 };
byte current_0[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_1[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_2[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_3[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_4[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_5[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_6[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
byte current_7[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int game_active = true;
int cursor_pos_x = 0;
int cursor_pos_y = 0;
int field_px_size;
int display_width = 128;
int display_height = 64;
int field_start_x;
int field_start_y;
int draw_row;

int generate(int info_arr) {
////// FUNCTION BODY //////
byte[] arr = { 0, 0, 0, 0, 0, 0, 0, 0 };
int block = 0;
int block_num = 3;
for (int i = 0; i < field_size; i++) {
  arr[i] = random( 0, 1 );
  if (arr[i] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = (block_num - 1);
  block = 0;
}
}
info_arr[block_num] = block;
return arr;

}
int calc_column(int x) {
////// FUNCTION BODY //////
byte[] info_arr = { 0, 0, 0, 0 };
int block = 0;
int block_num = 3;
if (board_0[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_1[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_2[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_3[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_4[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_5[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_6[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
if (board_7[x] == 1) {
  block = (block + 1);
} else if (block > 0) {
  info_arr[m] = block;
  block_num = (block_num - 1);
  block = 0;
}
info_arr[m] = block;
return info_arr;

}
int check_row(byte[] board, byte[] current) {
////// FUNCTION BODY //////
for (int i = 0; i < field_size; i++) {
  if (board[i] != current[i]) {
  return 0;
}
}
return 1;

}
int check_board() {
////// FUNCTION BODY //////
return (((((((check_row( board_0, current_0 ) + check_row( board_1, current_1 )) + check_row( board_2, current_2 )) + check_row( board_3, current_3 )) + check_row( board_4, current_4 )) + check_row( board_5, current_5 )) + check_row( board_6, current_6 )) + check_row( board_7, current_7 )) == 8;

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
arduboy.clear();
if (game_active && arduboy.everyXFrames( 8 )) {
  if (check_board()) {
  game_active = false;
  arduboy.drawBitmap( 0, 0, gfx_win + GFX_WIN_FRAMESIZE*(0), GFX_WIN_WIDTH, GFX_WIN_HEIGHT, WHITE );
} else if (arduboy.pressed( RIGHT_BUTTON )) {
  cursor_pos_x = min( (cursor_pos_x + 1), 7 );
} else if (arduboy.pressed( LEFT_BUTTON )) {
  cursor_pos_x = max( (cursor_pos_x - 1), 0 );
} else if (arduboy.pressed( DOWN_BUTTON )) {
  cursor_pos_y = min( (cursor_pos_y + 1), 7 );
} else if (arduboy.pressed( UP_BUTTON )) {
  cursor_pos_y = max( (cursor_pos_y - 1), 0 );
} else if (arduboy.pressed( A_BUTTON )) {
  mark_row( cursor_pos_x, cursor_pos_y );
}
}
for (int i = 0; i < 4; i++) {
  arduboy.drawBitmap( (field_start_x + 0 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_0[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 1 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_1[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 2 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_2[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 3 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_3[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 4 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_4[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 5 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_5[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 6 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_6[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( (field_start_x + 7 * sprite_size), ((field_start_y - 6) - i * sprite_size), gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_7[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
}
draw_row( game, 0, current_0, row_info_0 );
draw_row( game, 1, current_1, row_info_1 );
draw_row( game, 2, current_2, row_info_2 );
draw_row( game, 3, current_3, row_info_3 );
draw_row( game, 4, current_4, row_info_4 );
draw_row( game, 5, current_5, row_info_5 );
draw_row( game, 6, current_6, row_info_6 );
draw_row( game, 7, current_7, row_info_7 );
arduboy.fillRect( (field_start_x + field_px_size), field_start_y, (field_start_x + field_px_size), display_height, WHITE );
arduboy.fillRect( field_start_x, (field_start_y + field_px_size), (field_start_x + field_px_size), (field_start_y + field_px_size), WHITE );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
