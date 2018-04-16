const profile = {
  // 128x64 pixel 16-bit color LCD screen
  screen: {
    width: 96,
    height: 64,
    colorDensity: 16, // bits per pixel
  },

  // multichannel audio
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
      ctype: 'const uint16_t'
    }
  },

  // Code generator (export code for platform target)
  // TODO: fix the workaround by creating a proper library
  //export: require('./codegen'),
  export: (game) => require('./codegen')(game).replace(/tiny_arcade\./g, 'tiny_arcade_'),
}


module.exports = profile;
