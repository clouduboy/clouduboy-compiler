/* @flow */

declare type MicroCanvasGFXObject = {
  width: number;
  height: number;
  frames: ?number;
};

declare class MicroCanvas {
  constructor(): MicroCanvas;

  // MicroCanvas runtime/framework-specific methods
  setup(setupFunction: (game: ?MicroCanvas) => void): void;
  loop(loopFunction: () => void): void;
  reset(): void;

  frameCount: number;
  frameRate: number;

  // Standard HTML5Canvas properties & methods
  width: number;
  height: number;

  fillStyle: string;

  drawImage(sprite: MicroCanvasGFXObject, x: number, y: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
  drawText(text: string, x: number, y: number, size: ?number): void;

  // MicroCanvas library additions for easier game development
  loadSprite(pif: string): MicroCanvasGFXObject;

  clearImage(sprite: MicroCanvasGFXObject, x: number, y: number): void;
  eraseImage(sprite: MicroCanvasGFXObject, x: number, y: number): void;
  centerText(text: string, x: number, y: number): void;
  clear(): void;

  buttonPressed(button: string): boolean;
  everyXFrames(speed: number): boolean;
  detectCollision(sprite1: MicroCanvasGFXObject, x1: number, y1: number,
                  sprite2: MicroCanvasGFXObject, x2: number, y2: number): boolean;

  random(from: number, to: number): number;
}
