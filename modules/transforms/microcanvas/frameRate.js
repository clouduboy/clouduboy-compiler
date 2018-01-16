// game.frameRate   >>>   60

/**
(`number`) Game frame rate.

This property describes how fast the game runs, e.g. how many times
`loop()` runs and the screen refreshes in a second.

[!] Note
This property describes the "best-case-scenario", that is, it is
expected that the main loop won't run *more often* than every 1/60th
of a second (~16ms), **but**, especially for complex games and/or
on/for slow devices it might happen that rendering a single frame
takes longer than 16ms, and thus the device constantly "lags behind",
and the *actual* (=perceived) frame rate is less than 60 screen
refreshes per second.

This property is currently not modifiable (at least not in the compiler),
but changing it might come handy sometimes (e.g. setting a lower frame
rate to conserve battery life of the target device or to make sure
more complex game run more smoothly, etc.)
*/

// TODO: allow setting this in setup()
module.exports = (context) => '60';
