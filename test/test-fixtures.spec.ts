import "jest"
import Compiler from "ts-transform-test-compiler"
import * as Path from "path"
import { mkdir, ls, echo } from "shelljs"
import { JsxEmit } from "typescript"

const tsxControlStatements = require("../src/transformer").default,
  rootDir = Path.resolve(__dirname, ".."),
  fixturesDir = Path.resolve(__dirname, "__fixtures__"),
  outFixturesDir = Path.resolve(rootDir, "lib", "test", "__fixtures__")

mkdir("-p", outFixturesDir)


const files = ls("test/__fixtures__/*.tsx")
files
  //.filter(it => it.includes("choose"))
  .forEach(file => {
  const basename = file.split("/").pop(),
    name = basename.split(".").slice(0, -1).join(".")
  
  describe(name, function () {
    
    let compiler: Compiler
    
    beforeEach(() => {
      compiler = new Compiler(tsxControlStatements, "lib/test/__fixtures__", {
        noImplicitAny: false,
        noUnusedLocals: false,
        listEmittedFiles: true,
        esModuleInterop: true,
        jsx: JsxEmit.ReactJSX,
        removeComments: true,
        skipLibCheck: true,
        strictNullChecks: false,
        strict: false
      }).setRootDir(".")
    })

    it(name, function () {
      const transformParams = {}
      const result = compiler
        .setSourceFiles(file)
        .compile(name, transformParams)

      result.print()
      expect(result.succeeded).toBeTruthy()
    })
  })
})
