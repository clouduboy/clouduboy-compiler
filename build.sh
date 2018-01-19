# Compiles the input MicroCanvas JS passed as the first parameter
# to C++ source code aimed at the Arduboy platform.
# Creates game.ino (Aruboy C++ code) and game.json (input AST)
# Saves the compile output to compile.log
if [ -e $1 ]; then
  node build.js $1 > data/compile.log

  # Appends the Flow header (that contains the flow typedefs)
  # to the input JS file and runs it through Flow suggest to
  # explicitly include all inferred types.
  # It creates game.flow.js from the inferred type suggestions.
  node modules/flow/flow $1 > data/game.flow.js

  # Checks the file for Flow errors and saves them into
  # game.flow-check.log, also displays the errors
  # TODO: implement in modules/flow & use that
  npx flow check data/game.flow.js > data/game.flow-check.log
  cat data/game.flow-check.log

  # Generate and store the AST too
  node modules/flow/flow $1 > data/game.flow-ast.json
fi

# Copies the game.ino compile output file to clouduboy-platforms
# for compilation
cp data/game.ino ../clouduboy-platforms/lib/Arduboy-1.1.1/sources/_compile.ino

# Compiles the input Arduino source and saves the
# compile output to build.log
pushd ../clouduboy-platforms/lib/Arduboy-1.1.1/
./test.sh _compile.ino &> ~/data/clouduboy-compiler/data/build.log
popd

cat data/build.log
