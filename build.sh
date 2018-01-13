node build.js testsuite/208-picross.js > compile.log

cp game.ino ../clouduboy-platforms/lib/Arduboy-1.1.1/sources/_compile.ino

pushd ../clouduboy-platforms/lib/Arduboy-1.1.1/
./test.sh _compile.ino &> ~/data/clouduboy-compiler/build.log
popd
