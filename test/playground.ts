import "jest"
import Compiler from "ts-transform-test-compiler"
import * as Path from "path"
import * as Fs from "fs"
import { mkdir, ls, echo } from "shelljs"
import { JsxEmit } from "typescript"

const tsxControlStatements = require("../src/transformer").default,
  rootDir = Path.resolve(__dirname, ".."),
  fixturesDir = Path.resolve(__dirname, "__fixtures__"),
  outFixturesDir = Path.resolve(rootDir, "lib", "test", "__fixtures__")

mkdir("-p", outFixturesDir)

const compiler = new Compiler(tsxControlStatements, "lib/test/__fixtures__", {
    noImplicitAny: false,
    noUnusedLocals: false,
    listEmittedFiles: true,
    esModuleInterop: true,
    jsx: JsxEmit.ReactJSX,
    removeComments: true,
    skipLibCheck: true,
    strictNullChecks: false,
    strict: false
  })
    //require("../tsconfig.json").compilerOptions)

    .setRootDir("."),
  //files = ls("test/__fixtures__/for-02.tsx")
files = ls("test/__fixtures__/*.tsx")

files.forEach(file => {
  const basename = file.split("/").pop(),
    name = basename.split(".").slice(0, -1).join(".")
  echo(`Processing ${name} @ ${file}`)

  const transformParams = {}
  const result = compiler.setSourceFiles(file).compile(name, transformParams)

  result.print()
})
