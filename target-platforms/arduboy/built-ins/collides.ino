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
