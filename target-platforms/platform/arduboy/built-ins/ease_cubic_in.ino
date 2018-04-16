// t: current time, b: beginning value, c: change in value, d: duration
int ease_cubic_in(int x, int t, int b, int c, int d) {
  float td= (float)t/(float)d;
  return (int)(c * td*td*td + b +.5);
}
