#!/usr/bin/env bash
set -ex
mkdir -p babel
cd ./compatibility-cases
babel ./*.jsx --presets=es2015,react --plugins="jsx-control-statements" --out-dir=../babel
cd ..
echo "NYC"
nyc node ./fuse.js
