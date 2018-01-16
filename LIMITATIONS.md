# Compiler limitations
Please note: this is not an exhaustive list of _all_ the limitations ever, but more like an FAQ to help you better navigate what's (currently) possible and what not.

Please also note: **nothing** is inherently impossible to do, there are only two constraints:

1. development time (this is the more restrictive) - I can only spend so much time working on Clouduboy (this is my little pet project, after all). I have an an unending pool of TODO, with which if you want to help feel free to (all of Clouduboy is open-source and the complete code is openly accessible on GitHub). That said, feel free to contribute in any way, but also don't _expect_ anything.
2. device flash (device & program memory) - even the most complex feature feature can be re-implemented and polyfilled in C/C++. The problem is: how much code will it generate? Some of the devices that Clouduboy targets have a few kilobytes of memory with 30-ish kilobytes of flash (program) space. This is barely enough for anything and any features that Clouduboy adds will take away precious space from your _own_ code and ideas.


## List key:
* `warn` - the Clouduboy compiler will transform the code for you to C/C++ but your code may not compile and/or may not run, or crash, or eat your laundry. Usually the warnings that Clouduboy will show you also contain some info on how to avoid the warning in the first place. That said, there is a pretty good chance that in the browser your code/game will work just fine even if it generates warnings.
* `error` - crash & burn, baby! If you bump into one of these, the Clouduboy compiler will outright refuse to compile your code to C/C++ (and thus won't even attempt compiling it to a binaregendy HEX). Chances are that your code will run just fine in the browser, but unless you change it to comply with the stated limitations you won't be able to compile it and put it onto a precious pocketable plaything.


## Limitations

`Math.random`:

- `warn` Please consider using game.random for generating random integers.

`game.drawText`:

- `error` String concatenation/manipulation is currently unsupported. Please use template literals  (`${foo} something {bar}`).
- `warn` Long text does not wrap, and there is a limitation of 32 characters for the template literal + expression buffer (template  literals that contain no expressions compile to string literals and, thus, unaffected by this)

`Ternart`:
* `warn` In library calls (e.g. drawImage) ternaries are reused, if they contain side effects that might cause problems on execution.

`Array`-s:

* `error` Arrays can only be created on the global scope.
* `error` Array literals can only be used on the global scope.
* `error` Passing arrays as function parameters are currently not supported
* `error` Functions returning arrays are not supported.
* `error` Arrays of sprites are currently unsupported. Please consider using name prefixes or multiframe sprites instead.
* `error` Currently only arrays of numbers (signed integers) are supported. Support for byte arrays using TypedArrays is planned.
* `error` Arrays of arrays (multi-dimensional arrays) are currently not supported (but are being considered--please file an issue on the GitHub repo with a usecase!).

`Object`-s:
* `error` Objects are currently unsupported (but are being considered), in the meantime please use a prefixed globals instead.

`Function`-s:
- `error` Nested functions are currently not supported. Please use functions declared on the global scope instead.
- `warn` Please consider using function declarations instead of function-valued let/const bindings. Function object created via function expressions & arrow functions and stored as variables declared on the global scope are currently converted to function declarations and are automatically hoisted & available throughout the whole code (no dead-zone).
