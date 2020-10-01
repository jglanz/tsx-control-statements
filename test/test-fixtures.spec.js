"use strict";
exports.__esModule = true;
require("jest");
var ts_transform_test_compiler_1 = require("ts-transform-test-compiler");
var Path = require("path");
var shelljs_1 = require("shelljs");
var typescript_1 = require("typescript");
var tsxControlStatements = require("../src/transformer")["default"], rootDir = Path.resolve(__dirname, ".."), fixturesDir = Path.resolve(__dirname, "__fixtures__"), outFixturesDir = Path.resolve(rootDir, "lib", "test", "__fixtures__");
shelljs_1.mkdir("-p", outFixturesDir);
var files = shelljs_1.ls("test/__fixtures__/*.tsx");
files.forEach(function (file) {
    var basename = file.split("/").pop(), name = basename.split(".").slice(0, -1).join(".");
    describe(name, function () {
        var compiler;
        beforeEach(function () {
            compiler = new ts_transform_test_compiler_1["default"](tsxControlStatements, "lib/test/__fixtures__", {
                noImplicitAny: false,
                noUnusedLocals: false,
                listEmittedFiles: true,
                esModuleInterop: true,
                jsx: typescript_1.JsxEmit.ReactJSX,
                removeComments: true,
                skipLibCheck: true,
                strictNullChecks: false,
                strict: false
            }).setRootDir(".");
        });
        it(name, function () {
            var transformParams = {};
            var result = compiler
                .setSourceFiles(file)
                .compile(name, transformParams);
            result.print();
            expect(result.succeeded).toBeTruthy();
        });
    });
});
//# sourceMappingURL=test-fixtures.spec.js.map