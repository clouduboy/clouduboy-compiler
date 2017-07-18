void setup() {
  _microcanvas_frame_counter = 0;

  // cpuLoad() will only be 0 right after boot
  if (!arduboy.cpuLoad()) arduboy.begin();

////// CUSTOM SETUP //////
$__contents__;
}
