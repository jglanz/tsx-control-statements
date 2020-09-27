#!/usr/bin/env bash

yarn babel ./compatibility-cases --presets=es2015,react --plugins="jsx-control-statements" --out-dir=./test/babel
nyc node ./fuse.js
