#!/usr/bin/env fish

#if ! test -e index.d.ts
#  if test -d lib && test "$NODE_ENV" = "production"
#    echo echo "$PWD/lib cleaned"
#    rm -Rf lib
#  end
#
#
#end

mkdir -p lib/dist lib/test
cp package.json lib/dist
