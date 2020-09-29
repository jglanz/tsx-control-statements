import "jest"
import Compiler from 'ts-transform-test-compiler'
import * as Path from 'path'
import * as Fs from 'fs'
import {mkdir} from "shelljs"

const tsxControlStatements = require('../src/transformer').default,
  rootDir = Path.resolve(__dirname, ".."),
  fixturesDir = Path.resolve(__dirname, "__fixtures__"),
  outFixturesDir = Path.resolve(rootDir, "lib", "test", "__fixtures__")

mkdir("-p",outFixturesDir)


describe('My test suite', function () {
  const compiler = new Compiler(tsxControlStatements, "lib/test/__fixtures__").setRootDir(".")
  
  it('for-01', function () {
    const transformParams = { astring: 'hello', anumber: 12 }
    const result = compiler.setSourceFiles('test/__fixtures__/*.tsx')
      .compile('for-01', transformParams)
    
    result.print()
    expect(result.succeeded).toBeTruthy()
    
    //expect(result.requireContent()).to.equal('Working!')
  })
})
