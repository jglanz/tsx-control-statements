import "jest"
import Compiler from 'ts-transform-test-compiler'
import * as Path from 'path'
import * as Fs from 'fs'
import {mkdir} from "shelljs"
import { JsxEmit } from "typescript"

const tsxControlStatements = require('../src/transformer').default,
  rootDir = Path.resolve(__dirname, ".."),
  fixturesDir = Path.resolve(__dirname, "__fixtures__"),
  outFixturesDir = Path.resolve(rootDir, "lib", "test", "__fixtures__")

mkdir("-p",outFixturesDir)

const compiler = new Compiler(tsxControlStatements, "lib/test/__fixtures__",{
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "listEmittedFiles": true,
    "esModuleInterop": true,
    jsx:JsxEmit.ReactJSX,
    "removeComments": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "strict": false,
})
//require("../tsconfig.json").compilerOptions)
  
  .setRootDir(".")
  
  
    const transformParams = { astring: 'hello', anumber: 12 }
    const result = compiler.setSourceFiles('test/__fixtures__/*.tsx')
      .compile('for-01', transformParams)
    
    result.print()
    