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
}


module.exports = profile;
