#!/usr/bin/env fish

set scriptDir (dirname (status filename))
echo "scriptDir="$scriptDir

source $scriptDir/build.fish


set NPM_VERSION $argv[1]

if test -z "$NPM_VERSION";then
  echo "package version must be provided"
  exit 255
end

git push --tags
echo Publishing

#mkdir -p lib/dist
cp README.md package.json lib/dist
#cd src
#find ./ -name "*.ts" | xargs -IsrcFile cp srcFile ../lib

pushd lib/dist
npm publish --tag latest
cp package.json ../
popd
git push
echo "Successfully released version $NPM_VERSION!"
