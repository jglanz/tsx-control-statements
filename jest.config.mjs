//import tsjPreset from 'ts-jest/presets'

export default {
  verbose: true,
  preset: "ts-jest",
  //testRegex: "/test/.*\\.spec\\.tsx?$",
  testRegex: "/test/test-fixtures\\.spec\\.tsx?$",
  moduleDirectories: [
    "node_modules"
  ],
  //setupFilesAfterEnv: ["<rootDir>/dist/test/test-setup.js"],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ]
}
