const tsNodeOpts = require("../tsconfig.json")

require("ts-node").register(tsNodeOpts)

const { FuseBox, QuantumPlugin } = require("fuse-box")
const statements = require("../src/transformer.ts").default
const
  Path = require("path"),
  Fs = require("fs"),
  { mkdirSync, readdirSync } = Fs,
  rootDir = Path.resolve(__dirname, ".."),
  Sh = require("shelljs")


Sh.mkdir("-p",Path.resolve(rootDir, "lib","test","generated","babel"))
Sh.mkdir("-p",Path.resolve(rootDir, "lib","test","generated","tsc"))

for (const [homeDir, output] of [
  ["./compatibility-cases", "../lib/test/generated/babel/$name.js"],
  ["./tsx-cases", `../lib/test/generated/tsc/tsx-$name.js`]
]) {
  readdirSync(homeDir)
    .filter(
      caseFile =>
        ["with", "choose","nested", "for", "if"].some(type => caseFile.includes(type)) &&
        [".jsx", ".tsx"].some(ext => caseFile.endsWith(ext))
    )
    .forEach(caseFile => {
      const [bundle] = caseFile.split(".")
      const fuse = FuseBox.init({
        homeDir,
        output,
        transformers: {
          before: [statements()]
        },
        useTypescriptCompiler: true,
        cache: false,
        target: "npm",
        globals: { default: "*" },
        plugins: [
          QuantumPlugin({
            bakeApiIntoBundle: bundle
          })
        ]
      })
      fuse.bundle(bundle).instructions(`> [${caseFile}]`)
      fuse.run()
    })
}
