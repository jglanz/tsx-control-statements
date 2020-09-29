"use strict";
exports.__esModule = true;
require("jest");
var ts_transform_test_compiler_1 = require("ts-transform-test-compiler");
var Path = require("path");
var shelljs_1 = require("shelljs");
var tsxControlStatements = require('../src/transformer')["default"], rootDir = Path.resolve(__dirname, ".."), fixturesDir = Path.resolve(__dirname, "__fixtures__"), outFixturesDir = Path.resolve(rootDir, "lib", "test", "__fixtures__");
shelljs_1.mkdir("-p", outFixturesDir);
describe('My test suite', function () {
    var compiler = new ts_transform_test_compiler_1["default"](tsxControlStatements, "lib/test/__fixtures__").setRootDir(".");
    it('for-01', function () {
        var transformParams = { astring: 'hello', anumber: 12 };
        var result = compiler.setSourceFiles('test/__fixtures__/*.tsx')
            .compile('for-01', transformParams);
        result.print();
        expect(result.succeeded).toBeTruthy();
        //expect(result.requireContent()).to.equal('Working!')
    });
});
//# sourceMappingURL=test-fixtures.spec.js.map