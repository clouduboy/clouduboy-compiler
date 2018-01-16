// game.frameCount   >>>   _microcanvas_frame_counter

/**
(`number`) Current frame count.

This property keeps track of the current number of frames (screen refreshes)
since the device was turned on/game was loaded.

[!] Note
Keep in mind when you use the property that due to target device hardware
limitations this property gets reset to zero fairly often (currently, every 60.000
frames). This is due to some 8-bit targets (mostly Arduino) are storing this value
as UInt16. Keep this overflow in mind when you use to track frame durations and
always use with modulo (%) to track track intervals (or better yet, use the
`@everyXFrames()` built-in library function)

On the target this is accessed via the `_microcanvas_frame_counter` global variable
*/

module.exports = (context) => '_microcanvas_frame_counter';
