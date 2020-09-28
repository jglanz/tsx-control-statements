#!/usr/bin/env fish

set scriptDir (dirname (status filename))
echo "scriptDir="$scriptDir

source $scriptDir/init.fish
#set tscArgs --preserveWatchOutput

echo "Building with args: $tscArgs"
tsc -b src/tsconfig.json
#tsc $tscArgs
tsc -b tsconfig.json $argv  --preserveWatchOutput
echo "$PWD/lib successfully built"
