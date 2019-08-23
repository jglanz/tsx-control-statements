"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function transformer(program) {
    return function (context) { return function (file) { return visitNodes(file, program, context); }; };
}
exports.default = transformer;
function visitNodes(node, program, context) {
    var newNode = statements(node, program, context);
    if (node !== newNode) {
        return newNode;
    }
    return ts.visitEachChild(node, function (childNode) { return visitNodes(childNode, program, context); }, context);
}
var CTRL_NODE_NAMES = Object.freeze({
    CONDITIONAL: 'If',
    FOREACH: 'For',
    SWITCH: 'Choose',
    CASE: 'When',
    DEFAULT: 'Otherwise',
    WITH: 'With'
});
var isRelevantJsxNode = function (node) { return ts.isJsxElement(node)
    || ts.isJsxSelfClosingElement(node)
    || ts.isJsxExpression(node)
    || ts.isJsxText(node) && node.getText() !== ''; };
var getTagNameString = function (node) {
    if (ts.isJsxSelfClosingElement(node)) {
        return node.tagName.getFullText();
    }
    var maybeOpeningElement = node.getChildAt(0);
    if (!ts.isJsxOpeningElement(maybeOpeningElement)) {
        return null;
    }
    return maybeOpeningElement.tagName.getFullText();
};
var getJsxProps = function (node) {
    var isOpening = ts.isJsxOpeningElement(node.getChildAt(0));
    var isSelfClosing = ts.isJsxSelfClosingElement(node);
    if (!isOpening && !isSelfClosing) {
        return {};
    }
    var elementWithProps = isOpening
        ? node.getChildAt(0)
        : node;
    var props = elementWithProps
        .getChildAt(2)
        .getChildAt(0)
        .getChildren()
        .filter(ts.isJsxAttribute)
        .map(function (x) {
        var _a;
        return (_a = {}, _a[x.getChildAt(0).getText()] = x.getChildAt(2), _a);
    });
    return Object.assign.apply(Object, __spread([{}], props));
};
var getJsxElementBody = function (node, program, ctx) { return node.getChildAt(1)
    .getChildren()
    .filter(isRelevantJsxNode)
    .map(function (node) {
    if (ts.isJsxText(node)) {
        var text = trim(node.getFullText());
        return text ? ts.createLiteral(text) : null;
    }
    return visitNodes(node, program, ctx);
}).filter(Boolean); };
var trim = function (from) { return from.replace(/^\r?\n[\s\t]*/, '').replace(/\r?\n[\s\t]*$/, ''); };
var nullJsxExpr = function () { return ts.createJsxExpression(undefined, ts.createNull()); };
var createExpressionLiteral = function (expressions) { return expressions.length === 1
    ? ts.createJsxExpression(undefined, expressions[0])
    : ts.createArrayLiteral(expressions); };
var transformIfNode = function (node, program, ctx) {
    var condition = getJsxProps(node).condition;
    if (!condition) {
        console.warn("tsx-ctrl: " + CTRL_NODE_NAMES.CONDITIONAL + " missing condition props");
        return nullJsxExpr();
    }
    var body = getJsxElementBody(node, program, ctx);
    if (body.length === 0) {
        console.warn("tsx-ctrl: empty " + CTRL_NODE_NAMES.CONDITIONAL);
        return nullJsxExpr();
    }
    return ts.createJsxExpression(undefined, ts.createConditional(condition, createExpressionLiteral(body), ts.createNull()));
};
var makeArrayFromCall = function (args) {
    return ts.createJsxExpression(undefined, ts.createCall(ts.createPropertyAccess(ts.createIdentifier('Array'), 'from'), undefined, args));
};
var transformForNode = function (node, program, ctx) {
    var _a = getJsxProps(node), each = _a.each, of = _a.of, index = _a.index, functionLoopBody = _a.body;
    if (!of) {
        console.warn("tsx-ctrl: 'of' property of " + CTRL_NODE_NAMES.FOREACH + " is missing");
        return nullJsxExpr();
    }
    if (functionLoopBody) {
        var func = functionLoopBody.getChildAt(1);
        if (ts.isArrowFunction(func) || ts.isFunctionExpression(func)) {
            return makeArrayFromCall([of, func]);
        }
    }
    var body = getJsxElementBody(node, program, ctx);
    if (body.length === 0) {
        console.warn("tsx-ctrl: Empty " + CTRL_NODE_NAMES.FOREACH);
        return nullJsxExpr();
    }
    var arrowFunctionArgs = [each, index].map(function (arg) { return arg && ts.createParameter(undefined, undefined, undefined, arg.getText().slice(1, -1)); }).filter(Boolean);
    var arrowFunction = ts.createArrowFunction(undefined, undefined, arrowFunctionArgs, undefined, undefined, createExpressionLiteral(body));
    return makeArrayFromCall([of, arrowFunction]);
};
var transformChooseNode = function (node, program, ctx) {
    var elements = node
        .getChildAt(1)
        .getChildren()
        .filter(function (node) { return isRelevantJsxNode(node) && [CTRL_NODE_NAMES.CASE, CTRL_NODE_NAMES.DEFAULT].includes(String(getTagNameString(node))); })
        .map(function (node) {
        var tagName = getTagNameString(node);
        var condition = getJsxProps(node).condition;
        var nodeBody = getJsxElementBody(node, program, ctx);
        return { condition: condition, nodeBody: nodeBody, tagName: tagName };
    })
        .filter(function (node, index, array) {
        if (node.nodeBody.length === 0) {
            console.warn("tsx-ctrl: Empty " + CTRL_NODE_NAMES.CASE);
            return false;
        }
        if (!node.condition && node.tagName !== CTRL_NODE_NAMES.DEFAULT) {
            console.warn("tsx-ctrl: " + CTRL_NODE_NAMES.CASE + " without condition will be skipped");
            return false;
        }
        if (node.tagName === CTRL_NODE_NAMES.DEFAULT && index !== array.length - 1) {
            console.log("tsx-ctrl: " + CTRL_NODE_NAMES.DEFAULT + " must be the last node in a " + CTRL_NODE_NAMES.SWITCH + " element!");
            return false;
        }
        return true;
    });
    if (elements.length === 0) {
        console.warn("tsx-ctrl: Empty " + CTRL_NODE_NAMES.SWITCH);
        return nullJsxExpr();
    }
    var last = elements[elements.length - 1];
    var _a = __read(last && last.tagName === CTRL_NODE_NAMES.DEFAULT
        ? [elements.slice(0, elements.length - 1), last]
        : [elements, null], 2), cases = _a[0], defaultCase = _a[1];
    var defaultCaseOrNull = defaultCase ? createExpressionLiteral(defaultCase.nodeBody) : ts.createNull();
    return ts.createJsxExpression(undefined, cases.reduceRight(function (conditionalExpr, _a) {
        var condition = _a.condition, nodeBody = _a.nodeBody;
        return ts.createConditional(condition, createExpressionLiteral(nodeBody), conditionalExpr);
    }, defaultCaseOrNull));
};
var transformWithNode = function (node, program, ctx) {
    var props = getJsxProps(node);
    var iifeArgs = Object.keys(props).map(function (key) { return ts.createParameter(undefined, undefined, undefined, key); });
    var iifeArgValues = Object.values(props);
    var body = getJsxElementBody(node, program, ctx);
    return ts.createJsxExpression(undefined, ts.createCall(ts.createArrowFunction(undefined, undefined, iifeArgs, undefined, undefined, createExpressionLiteral(body)), undefined, iifeArgValues));
};
var STUB_PACKAGE_REGEXP = /("|')tsx-control-statements\/components(.ts)?("|')/;
var getTransformation = function (node) {
    var isStubsImport = ts.isImportDeclaration(node) && node.getChildren().some(function (child) { return STUB_PACKAGE_REGEXP.test(child.getFullText()); });
    if (isStubsImport) {
        return function (a, b, c) { return ts.createEmptyStatement(); };
    }
    if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) {
        return function (a, b, c) { return a; };
    }
    var tagName = getTagNameString(node);
    switch (tagName) {
        case CTRL_NODE_NAMES.CONDITIONAL: return transformIfNode;
        case CTRL_NODE_NAMES.FOREACH: return transformForNode;
        case CTRL_NODE_NAMES.SWITCH: return transformChooseNode;
        case CTRL_NODE_NAMES.WITH: return transformWithNode;
        default: return function (a, b, c) { return a; };
    }
};
var statements = function (node, program, ctx) { return getTransformation(node)(node, program, ctx); };
