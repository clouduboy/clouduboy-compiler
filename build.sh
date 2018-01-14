# Compiles the input MicroCanvas JS passed as the first parameter
# to C++ source code aimed at the Arduboy platform.
# Creates game.ino (Aruboy C++ code) and game.json (input AST)
# Saves the compile output to compile.log
if [ -e $1 ]; then
  node build.js $1 > compile.log

  # Appends the Flow header (that contains the flow typedefs)
  # to the input JS file and runs it through Flow suggest to
  # explicitly include all inferred types.
  #cat modules/flow/microcanvas.d.js $1 > game.flow.js
  echo '/* @flow */' | cat - $1 > game.flow.js 


  # Checks the file for Flow errors and saves them into
  # game.flow-check.log, also displays the errors
  npx flow check game.flow.js > game.flow-check.log
  cat game.flow-check.log

  # It patches the original file with these inferred type
  # suggestions and saves it as game.flow.js
  npx flow suggest game.flow.js | patch game.flow.js
fi

# Copies the game.ino compile output file to clouduboy-platforms
# for compilation
cp game.ino ../clouduboy-platforms/lib/Arduboy-1.1.1/sources/_compile.ino

# Compiles the input Arduino source and saves the
# compile output to build.log
pushd ../clouduboy-platforms/lib/Arduboy-1.1.1/
./test.sh _compile.ino &> ~/data/clouduboy-compiler/build.log
popd

cat build.log
