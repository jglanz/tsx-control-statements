# TODO

## Reimplement testing

The old testing was the ugliest bit of a well written package.

For reference, old scripts below:

```json 
{
  "test:ci": "./runtests.sh",
  "test:compile": "cd ../test && ./compile-cases.sh && cd ..",
  "//test:run-compiled": "mocha ../test/helpers/browser-env.js \\\"test/**/*.spec.js\\\"",
  "test:coverage": "nyc report --reporter=text-lcov | coveralls",
  "test:html-report": "nyc report --reporter=html"
}   
```

- [x] Baseline Jest scripts 
- [x] Recognize new fixtures as suites
- [ ] Create expected results system
