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

PROGMEM const unsigned char gfx_win[] = {
  /*13x5*/ 0x00, 0x0e, 0x10, 0x08, 0x10, 0x0e, 0x00, 0x1e, 0x00, 0x1e, 0x04, 0x08, 0x1e };
PROGMEM const unsigned char gfx_field[] = {
  /*5x5x4*/ 0x1f, 0x01, 0x01, 0x01, 0x01, 0x1f, 0x01, 0x0d, 0x0d, 0x01, 0x1f, 0x1f, 0x13, 0x13, 0x1f, 0x1f, 0x1f, 0x1f, 0x1f, 0x1f };
PROGMEM const unsigned char gfx_numbers[] = {
  /*5x5x12*/ 0x00, 0x1e, 0x12, 0x1e, 0x00, 0x00, 0x00, 0x1e, 0x00, 0x00, 0x00, 0x1a, 0x1a, 0x16, 0x00, 0x00, 0x12, 0x1a, 0x1e, 0x00, 0x00, 0x0e, 0x08, 0x1c, 0x00, 0x00, 0x16, 0x1a, 0x1a, 0x00, 0x00, 0x1e, 0x18, 0x18, 0x00, 0x00, 0x02, 0x02, 0x1e, 0x00, 0x00, 0x1e, 0x1a, 0x1e, 0x00, 0x00, 0x0e, 0x0a, 0x1e, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };


const byte GFX_WIN_WIDTH = 13;
const byte GFX_WIN_HEIGHT = 5;
const byte GFX_WIN_FRAMES = 0;
const byte GFX_WIN_FRAMESIZE = 13;
const byte GFX_FIELD_WIDTH = 5;
const byte GFX_FIELD_HEIGHT = 5;
const byte GFX_FIELD_FRAMES = 4;
const byte GFX_FIELD_FRAMESIZE = 5;
const byte GFX_NUMBERS_WIDTH = 5;
const byte GFX_NUMBERS_HEIGHT = 5;
const byte GFX_NUMBERS_FRAMES = 12;
const byte GFX_NUMBERS_FRAMESIZE = 5;

int field_size = 8;
int sprite_size = 5;
int pressed = false;
int time_start;
int time_now;
int row_info_0[] = { 11, 11, 11, 11 };
int row_info_1[] = { 11, 11, 11, 11 };
int row_info_2[] = { 11, 11, 11, 11 };
int row_info_3[] = { 11, 11, 11, 11 };
int row_info_4[] = { 11, 11, 11, 11 };
int row_info_5[] = { 11, 11, 11, 11 };
int row_info_6[] = { 11, 11, 11, 11 };
int row_info_7[] = { 11, 11, 11, 11 };
int board_0[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_1[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_2[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_3[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_4[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_5[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_6[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int board_7[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int column_info_0[] = { 11, 11, 11, 11 };
int column_info_1[] = { 11, 11, 11, 11 };
int column_info_2[] = { 11, 11, 11, 11 };
int column_info_3[] = { 11, 11, 11, 11 };
int column_info_4[] = { 11, 11, 11, 11 };
int column_info_5[] = { 11, 11, 11, 11 };
int column_info_6[] = { 11, 11, 11, 11 };
int column_info_7[] = { 11, 11, 11, 11 };
int current_0[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_1[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_2[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_3[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_4[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_5[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_6[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_7[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int game_active;
int resetting = false;
int cursor_pos_x = 0;
int cursor_pos_y = 0;
int field_px_size = field_size * sprite_size;
int display_width = 128;
int display_height = 64;
int field_start_x = display_width - field_px_size - 1;
int field_start_y = display_height - field_px_size - 1;

void generate(int* board, int* info_arr) {
////// FUNCTION BODY //////
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( board ); ++_a_fill_idx_) board[_a_fill_idx_] = 0;
int block = 0;
int block_num = 3;
for (int i = 0; i < field_size; i++) {
  board[i] = random(0, 2);
  if (board[i] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
}
if (block > 0) {
  info_arr[block_num] = block;
}

}
void calc_column(int* info_arr, int x) {
////// FUNCTION BODY //////
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( info_arr ); ++_a_fill_idx_) info_arr[_a_fill_idx_] = 11;
int block = 0;
int block_num = 3;
if (board_0[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_1[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_2[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_3[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_4[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_5[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_6[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (board_7[ x ] == 1) {
  block = block + 1;
} else if (block > 0) {
  info_arr[block_num] = block;
  block_num = block_num - 1;
  block = 0;
}
if (block > 0) {
  info_arr[block_num] = block;
}

}
void mark(int* arr, int x) {
////// FUNCTION BODY //////
if (arr[x] == 0) {
  arr[x] = 1;
} else {
  arr[x] = 0;
}

}
void mark_row(int x, int y) {
////// FUNCTION BODY //////
if (y == 0) {
  mark( current_0, x );
} else if (y == 1) {
  mark( current_1, x );
} else if (y == 2) {
  mark( current_2, x );
} else if (y == 3) {
  mark( current_3, x );
} else if (y == 4) {
  mark( current_4, x );
} else if (y == 5) {
  mark( current_5, x );
} else if (y == 6) {
  mark( current_6, x );
} else if (y == 7) {
  mark( current_7, x );
}

}
int check_row(int* board, int* current) {
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
void start_game() {
////// FUNCTION BODY //////
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_0 ); ++_a_fill_idx_) row_info_0[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_1 ); ++_a_fill_idx_) row_info_1[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_2 ); ++_a_fill_idx_) row_info_2[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_3 ); ++_a_fill_idx_) row_info_3[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_4 ); ++_a_fill_idx_) row_info_4[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_5 ); ++_a_fill_idx_) row_info_5[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_6 ); ++_a_fill_idx_) row_info_6[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( row_info_7 ); ++_a_fill_idx_) row_info_7[_a_fill_idx_] = 11;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_0 ); ++_a_fill_idx_) current_0[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_1 ); ++_a_fill_idx_) current_1[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_2 ); ++_a_fill_idx_) current_2[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_3 ); ++_a_fill_idx_) current_3[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_4 ); ++_a_fill_idx_) current_4[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_5 ); ++_a_fill_idx_) current_5[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_6 ); ++_a_fill_idx_) current_6[_a_fill_idx_] = 0;
for (unsigned int _a_fill_idx_ = 0; _a_fill_idx_ < LENGTHOF( current_7 ); ++_a_fill_idx_) current_7[_a_fill_idx_] = 0;
generate( board_0, row_info_0 );
generate( board_1, row_info_1 );
generate( board_2, row_info_2 );
generate( board_3, row_info_3 );
generate( board_4, row_info_4 );
generate( board_5, row_info_5 );
generate( board_6, row_info_6 );
generate( board_7, row_info_7 );
calc_column( column_info_0, 0 );
calc_column( column_info_1, 1 );
calc_column( column_info_2, 2 );
calc_column( column_info_3, 3 );
calc_column( column_info_4, 4 );
calc_column( column_info_5, 5 );
calc_column( column_info_6, 6 );
calc_column( column_info_7, 7 );
game_active = true;
resetting = false;
time_start = _microcanvas_frame_counter;

}
void draw_row(int y, int* arr, int* info_arr) {
////// FUNCTION BODY //////
for (int x = 0; x < field_size; x++) {
  int type = arr[x];
  if (x == cursor_pos_x && y == cursor_pos_y) {
  type = type + 2;
}
  for (int i = 0; i < 4; i++) {
  arduboy.drawBitmap( (field_start_x - 5) - i * sprite_size, field_start_y + y * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(info_arr[i]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
}
  arduboy.drawBitmap( field_start_x + x * sprite_size, field_start_y + y * sprite_size, gfx_field + GFX_FIELD_FRAMESIZE*(type), GFX_FIELD_WIDTH, GFX_FIELD_HEIGHT, WHITE );
}

}

void setup() {
  _microcanvas_frame_counter = 0;

  // cpuLoad() will only be 0 right after boot
  if (!arduboy.cpuLoad()) arduboy.begin();

////// CUSTOM SETUP //////
start_game();
}

void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
arduboy.clear();
if (check_board()) {
  game_active = false;
  arduboy.drawBitmap( 0, 5, gfx_win + GFX_WIN_FRAMESIZE*(0), GFX_WIN_WIDTH, GFX_WIN_HEIGHT, WHITE );
}
if (!resetting && arduboy.everyXFrames( 3 )) {
  if (arduboy.pressed( RIGHT_BUTTON )) {
  if (!pressed) {
  cursor_pos_x = min( cursor_pos_x + 1, 7 );
  pressed = true;
}
} else if (arduboy.pressed( LEFT_BUTTON )) {
  if (!pressed) {
  cursor_pos_x = max( cursor_pos_x - 1, 0 );
  pressed = true;
}
} else if (arduboy.pressed( DOWN_BUTTON )) {
  if (!pressed) {
  cursor_pos_y = min( cursor_pos_y + 1, 7 );
  pressed = true;
}
} else if (arduboy.pressed( UP_BUTTON )) {
  if (!pressed) {
  cursor_pos_y = max( cursor_pos_y - 1, 0 );
  pressed = true;
  if (arduboy.pressed( B_BUTTON )) {
  //current_0 = board_0;
  //current_1 = board_1;
  //current_2 = board_2;
  //current_3 = board_3;
  //current_4 = board_4;
  //current_5 = board_5;
  //current_6 = board_6;
  //current_7 = board_7;
}
}
} else if (arduboy.pressed( A_BUTTON )) {
  if (!pressed) {
  pressed = true;
  if (game_active) {
  mark_row( cursor_pos_x, cursor_pos_y );
}
  if (arduboy.pressed( B_BUTTON )) {
  resetting = true;
  time_start = _microcanvas_frame_counter;
  start_game();
}
}
} else {
  pressed = false;
}
}
if (game_active) {
  time_now = _microcanvas_frame_counter;
}
int time_diff = time_now - time_start;
int time_diff_m = (int)floor( time_diff / 60 / 60 );
int time_diff_s = (int)floor( time_diff / 60 ) % 60;
arduboy.drawBitmap( 0, 0, gfx_numbers + GFX_NUMBERS_FRAMESIZE*((int)floor( time_diff_m / 10 )), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
arduboy.drawBitmap( 4, 0, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(time_diff_m - (int)floor( time_diff_m / 10 ) * 10), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
arduboy.drawBitmap( 8, 0, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(10), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
arduboy.drawBitmap( 12, 0, gfx_numbers + GFX_NUMBERS_FRAMESIZE*((int)floor( time_diff_s / 10 )), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
arduboy.drawBitmap( 16, 0, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(time_diff_s - (int)floor( time_diff_s / 10 ) * 10), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
for (int i = 0; i < 4; i++) {
  arduboy.drawBitmap( field_start_x + 0 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_0[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 1 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_1[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 2 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_2[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 3 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_3[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 4 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_4[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 5 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_5[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 6 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_6[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
  arduboy.drawBitmap( field_start_x + 7 * sprite_size, (field_start_y - 6) - i * sprite_size, gfx_numbers + GFX_NUMBERS_FRAMESIZE*(column_info_7[ i ]), GFX_NUMBERS_WIDTH, GFX_NUMBERS_HEIGHT, WHITE );
}
draw_row( 0, current_0, row_info_0 );
draw_row( 1, current_1, row_info_1 );
draw_row( 2, current_2, row_info_2 );
draw_row( 3, current_3, row_info_3 );
draw_row( 4, current_4, row_info_4 );
draw_row( 5, current_5, row_info_5 );
draw_row( 6, current_6, row_info_6 );
draw_row( 7, current_7, row_info_7 );
arduboy.fillRect( field_start_x + field_px_size, field_start_y, field_start_x + field_px_size, display_height, WHITE );
arduboy.fillRect( field_start_x, field_start_y + field_px_size, field_start_x + field_px_size, field_start_y + field_px_size, WHITE );
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
