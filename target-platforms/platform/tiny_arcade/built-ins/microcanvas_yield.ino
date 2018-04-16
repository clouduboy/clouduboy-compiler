void _microcanvas_yield(byte n) {
  arduboy.display();
  while(n>0) {
    while (!arduboy.nextFrame()) delay(1);
    --n;
  }
}
