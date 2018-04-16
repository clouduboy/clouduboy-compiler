void loop() {
  if (!tiny_arcade_nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

  ////// LOOP CONTENTS TO FOLLOW //////

////// LOOP CONTENTS TO FOLLOW //////
${params.contents};
////// END OF LOOP CONTENTS //////

  tiny_arcade_display();
}
