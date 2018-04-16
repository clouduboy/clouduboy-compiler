const profile = {
  // 128x64 pixel monochrome OLED screen
  screen: {
    width: 128,
    height: 64,
    colorDensity: 1, // bits per pixel
  },

  // 2-channel piezo sound
  sound: {
    channels: 2,
  },

  // Inputs: d-pad plus A/B button
  input: {
    dpad: true,
    buttonPrimary: true,
    buttonSecondary: true,
  },

  // Mappings
  mappings: {
    buttons: {
      left: 'LEFT_BUTTON',
      right: 'RIGHT_BUTTON',
      up: 'UP_BUTTON',
      down: 'DOWN_BUTTON',
      space: 'A_BUTTON',
      enter: 'B_BUTTON',
    },
    graphics: {
      ctype: 'const unsigned char'
    },
    progmem: 'PROGMEM'
  },

  // Code generator (export code for platform target)
  export: require('./arduboy/codegen'),
}


module.exports = profile;
