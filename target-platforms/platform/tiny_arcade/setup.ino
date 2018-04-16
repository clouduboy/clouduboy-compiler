void setup() {
  _microcanvas_frame_counter = 0;

  // TODO: reset compatibility
  // cpuLoad() will only be 0 right after boot
  arcadeInit();
  Wire.begin();

  _display.begin();
  _display.setFlip(0);
  _display.setBrightness(8);
  _display.setBitDepth(1);

////// CUSTOM SETUP //////
${params.contents};
}
