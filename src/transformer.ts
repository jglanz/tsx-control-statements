import * as ts from "typescript"
import { EmitHint } from "typescript"
import { Option } from "@3fv/prelude-ts"
import { isString } from "@3fv/guard"

const isDev = process.env.NODE_ENV === "development"

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
  omitTrailingSemicolon: true
})

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodes(
    file,
    program,
    context
  )
}

function visitNodes(
  file: ts.SourceFile,
  program: ts.Program,
  context: ts.TransformationContext
): ts.SourceFile;
function visitNodes(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;
function visitNodes(node: ts.Node, program: ts.Program, context: ts.TransformationContext) {
  const newNode = statements(node, program, context)
  if (node !== newNode) {
    return newNode
  }
  
  return ts.visitEachChild(node, childNode => visitNodes(childNode, program, context), context)
}

const CTRL_NODE_NAMES = Object.freeze({
  CONDITIONAL: "If",
  FOREACH: "For",
  SWITCH: "Choose",
  CASE: "When",
  DEFAULT: "Otherwise",
  WITH: "With"
})

type TS<N, R = ts.Node> = (
  node: N,
  program: ts.Program,
  context: ts.TransformationContext
) => Readonly<R>;

type Transformation = TS<ts.Node>;
type JsxTransformation = TS<ts.JsxElement>;

const isRelevantJsxNode = (node: ts.Node): node is ts.JsxElement =>
  ts.isJsxElement(node)
  || ts.isJsxSelfClosingElement(node)
  || ts.isJsxExpression(node)
  || ts.isJsxText(node) //&& node.getText() !== '';

const getTagNameString = (node: ts.Node): string => {
  if (ts.isJsxSelfClosingElement(node)) {
    return node.tagName?.getFullText()
  }
  
  const maybeOpeningElement = node.getChildAt(0) as ts.JsxOpeningElement
  return maybeOpeningElement?.tagName?.getFullText()
}

type PropMap = Readonly<ts.MapLike<ts.Expression>>;
const getJsxProps = (node: ts.JsxElement): PropMap => {
  const isOpening = ts.isJsxOpeningElement(node.getChildAt(0))
  const elementWithProps = isOpening
    ? node.getChildAt(0)
    : node
  
  const props = elementWithProps
    .getChildAt(2) // [tag (<), name (For, If, etc), attributes (...), tag (>)]
    .getChildAt(0) // some kinda ts api derp
    .getChildren()
    .filter(ts.isJsxAttribute)
    .map(x => (
      { [x.getChildAt(0).getText()]: x.getChildAt(2) as ts.Expression }
    ))
  
  return Object.assign({}, ...props)
}
const nullJsxExpr = () => ts.factory.createJsxExpression(undefined, ts.factory.createNull())

const newStringLiteral = (str: any) => Option.ofNullable(trim(
  str
))
  .filter(str => !!str && str.length > 0)
  .map(str => ts.factory.createStringLiteral(str))
  .getOrCall(() => nullJsxExpr() as any)

const fixLiteralString = (node: ts.Node | ts.Node[]): any => {
  return typeof (
    node as any
  )?.literal === "string" ?
    newStringLiteral((node as any).literal) :
    typeof (
      node as any
    ).expression?.literal === "string" ?
      newStringLiteral((
        node as any
      ).expression?.literal) :
      node as any
}

const sanitizeNodes = (nodeBody: ts.Node[]) => Array.isArray(nodeBody) ? nodeBody
    .filter(node => !(
      ts.isLiteralTypeNode(node) &&
      typeof (
        node as any
      ).literal ===
      "string" &&
      trim((
        node as any
      ).literal).length ===
      0
    ))
    .map(node => !!(
      node as any
    ).expression ?
      (
        node as any
      ).expression :
      node)
    .map(fixLiteralString)
    .filter(node => !(
      ts.isLiteralTypeNode(node) &&
      typeof (
        node as any
      ).literal ===
      "string" &&
      trim((
        node as any
      ).literal).length ===
      0
    )) as any :
  nodeBody


const getJsxElementBody = (
  node: ts.Node,
  program: ts.Program,
  ctx: ts.TransformationContext
): ts.Expression[] => node.getChildAt(1)
  .getChildren()
  .filter(isRelevantJsxNode)
  .map(
    (node: ts.Node) =>
      visitNodes(node, program, ctx)
  ).filter(Boolean) as ts.Expression[]

// const trace = <T>(item: T, ...logArgs: any[]) => console.log(item, ...logArgs) || item;
const trim = (from: string) => from.replace(/^\r?\n[\s\t]*/, "").replace(/\r?\n[\s\t]*$/, "")


const createExpressionLiteral =
  (expressions: ts.Expression[]): ts.ArrayLiteralExpression | ts.Expression =>
    expressions?.length === 1
      ?
      (
        ts.isJsxExpression(expressions[0]) ? expressions[0] :
          ts.factory.createJsxExpression(undefined, expressions[0])
      )
      :
      ts.factory.createArrayLiteralExpression(expressions.filter((node:any) => !(isString(node.text) && trim(node.text).length === 0)))
//((ts.isLiteralTypeNode(expressions[0]) && typeof (expressions[0] as any).literal === "string") ?
//           ts.factory.createJsxExpression(undefined, (expressions[0] as any).literal) :

const transformIfNode: JsxTransformation = (node, program, ctx) => {
  const { condition } = getJsxProps(node)
  if (!condition) {
    console.warn(`tsx-ctrl: ${ CTRL_NODE_NAMES.CONDITIONAL } missing condition props`)
    return nullJsxExpr()
  }
  
  const body = getJsxElementBody(node, program, ctx)
  
  if (body?.length === 0) {
    console.warn(`tsx-ctrl: empty ${ CTRL_NODE_NAMES.CONDITIONAL }`)
    return nullJsxExpr()
  }
  
  const newJsxExpression = ts.factory.createJsxExpression(
    undefined,
    ts.factory.createConditionalExpression(
      (
        condition as any
      )?.expression ?? condition,
      undefined,
      sanitizeNodes(fixLiteralString(createExpressionLiteral(sanitizeNodes(fixLiteralString((
        body
          .filter(node => !(node.kind === 286 && !(node as any).literal && !(node as any).expression))
      ))))))
      ,
      //createExpressionLiteral(fixLiteralString(sanitizeNodes(fixLiteralString(body)))),
      undefined,
      nullJsxExpr()
    )
  )
  
  if (isDev) {
    const expressionOut = printer.printNode(
      EmitHint.Unspecified,
      newJsxExpression,
      node.getSourceFile()
    )
    console.log("New IF", expressionOut)
    if (expressionOut.includes("(),")  || expressionOut.includes("[()")) {
      debugger
    }
  }
  return newJsxExpression
}

const makeArrayFromCall = (args: ts.Expression[]): ts.JsxExpression =>
  ts.factory.createJsxExpression(
    undefined,
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Array"), "from"),
      undefined,
      args
    )
  )

const transformForNode: JsxTransformation = (node, program, ctx) => {
  const { each, of, index, body: functionLoopBody } = getJsxProps(node)
  if (!of) {
    console.warn(`tsx-ctrl: 'of' property of ${ CTRL_NODE_NAMES.FOREACH } is missing`)
    return nullJsxExpr()
  }
  
  if (functionLoopBody) {
    // {body} - brackets are children 0 and 2, body is between
    const func = functionLoopBody.getChildAt(1)
    if (ts.isArrowFunction(func) || ts.isFunctionExpression(func)) {
      const transformedFunc = visitNodes(func, program, ctx) as any as ts.FunctionExpression
      return makeArrayFromCall([of, transformedFunc])
    }
  }
  
  const body = sanitizeNodes(fixLiteralString(getJsxElementBody(node, program, ctx)))
  
  if (body?.length === 0) {
    console.warn(`tsx-ctrl: Empty ${ CTRL_NODE_NAMES.FOREACH }`)
    return nullJsxExpr()
  }
  
  const arrowFunctionArgs =
    [each, index].map(
      arg => arg && ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        arg.getText().slice(1, -1)
      )
    ).filter(Boolean)
  
  const arrowFunction = ts.factory.createArrowFunction(
    undefined,
    undefined,
    arrowFunctionArgs,
    undefined, // type
    undefined,
    createExpressionLiteral(sanitizeNodes(fixLiteralString(body)))
  )
  
  return makeArrayFromCall([of, arrowFunction])
}

const transformChooseNode: JsxTransformation = (
  node: ts.Node,
  program: ts.Program,
  ctx: ts.TransformationContext
) => {
  const elements = (
    node
      .getChildAt(1)
      .getChildren()
      .filter(
        node =>
          isRelevantJsxNode(node)
          && [
            CTRL_NODE_NAMES.CASE,
            CTRL_NODE_NAMES.DEFAULT
          ].includes(getTagNameString(node))
      ) as ts.JsxElement[]
  )
    .map(node => {
      const tagName = getTagNameString(node)
      const { condition } = getJsxProps(node)
      const nodeBody = getJsxElementBody(node, program, ctx)
      
      return { condition, nodeBody, tagName }
    })
    .filter((node, index, array) => {
      if (node.nodeBody?.length === 0) {
        console.warn(`tsx-ctrl: Empty ${ CTRL_NODE_NAMES.CASE }`)
        return false
      }
      
      if (!node.condition && node.tagName !== CTRL_NODE_NAMES.DEFAULT) {
        console.warn(`tsx-ctrl: ${ CTRL_NODE_NAMES.CASE } without condition will be skipped`)
        return false
      }
      
      if (node.tagName === CTRL_NODE_NAMES.DEFAULT && index !== array?.length - 1) {
        console.log(`tsx-ctrl: ${ CTRL_NODE_NAMES.DEFAULT } must be the last node in a ${ CTRL_NODE_NAMES.SWITCH } element!`)
        return false
      }
      
      return true
    })
  
  if (elements?.length === 0) {
    console.warn(`tsx-ctrl: Empty ${ CTRL_NODE_NAMES.SWITCH }`)
    return nullJsxExpr()
  }
  
  const last = elements[elements?.length - 1]
  const [cases, defaultCase] = last && last.tagName === CTRL_NODE_NAMES.DEFAULT
    ? [elements.slice(0, elements?.length - 1), last]
    : [elements, null]
  
  const defaultCaseOrNull = defaultCase
    ? fixLiteralString(createExpressionLiteral(sanitizeNodes(fixLiteralString(defaultCase.nodeBody))))
    : nullJsxExpr() //ts.factory.createNull()
  
  // Only used when `isDev === true`
  let caseIndex = cases?.length
  const newJsxExpression = ts.factory.createJsxExpression(
    undefined,
    cases.reduceRight(
      (conditionalExpr, { condition, nodeBody: providedNodeBody }) => {
        const nodeBody = providedNodeBody
          .filter(node => !(node.kind === 286 && !(node as any).literal && !(node as any).expression))
          .map(node =>
            fixLiteralString(sanitizeNodes(fixLiteralString(node))))
        
        if (isDev) {
          const conditionOut = printer.printNode(
            EmitHint.Unspecified,
            condition,
            node.getSourceFile()
          )
          console.warn(`Index: ${ caseIndex }, Condition`, conditionOut)
          nodeBody.forEach((elem, bodyIdx) => {
            const out = printer.printNode(
              EmitHint.Unspecified,
              elem,
              node.getSourceFile()
            )
            console.warn(`Index: ${ caseIndex }, Body Index: ${ bodyIdx }`, out)
          })
        }
        
        const
          whenTrue = createExpressionLiteral(sanitizeNodes(fixLiteralString(
            nodeBody
              .filter(node => !(node.kind === 286 && !(node as any).literal && !(node as any).expression))
          )))
        
        if (isDev) {
          const currentConditionalOut = printer.printNode(
            EmitHint.Unspecified,
            conditionalExpr,
            node.getSourceFile()
          )
          console.warn(
            `Current conditional at index: ${ caseIndex }`,
            currentConditionalOut
          )
          caseIndex--
          
          if (currentConditionalOut.includes("(),")) {
            debugger
          }
        }
        return ts.factory.createConditionalExpression(
          (
            condition as any
          )?.expression ?? condition,
          undefined,
          Option.of(fixLiteralString(sanitizeNodes(fixLiteralString((
            whenTrue as any
          )?.expression ?? whenTrue))))
            .map((it:any) => Array.isArray(it) ? it.filter((node:any) => !(node.kind === 286 && !(node as any).literal && !(node as any).expression)) : it)
            .get(),
          undefined,
          conditionalExpr
        )
      },
      fixLiteralString(sanitizeNodes(fixLiteralString(defaultCaseOrNull?.expression ?? defaultCaseOrNull)))
    )
  )
  
  if (isDev) {
    const expressionOut = printer.printNode(
      EmitHint.Unspecified,
      newJsxExpression,
      node.getSourceFile()
    )
    console.log("New CHOOSE", expressionOut)
    if (expressionOut.includes("(),")) {
      debugger
    }
  }
  return newJsxExpression
}

const transformWithNode: JsxTransformation = (node, program, ctx) => {
  const props = getJsxProps(node)
  const iifeArgs = Object.keys(props).map(
    key => ts.factory.createParameterDeclaration(undefined, undefined, undefined, key)
  )
  const iifeArgValues = Object.values(props)
  const body = getJsxElementBody(node, program, ctx) as ts.Expression[]
  
  return ts.factory.createJsxExpression(
    undefined,
    ts.factory.createCallExpression(
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        iifeArgs,
        undefined,
        undefined,
        createExpressionLiteral(sanitizeNodes(body))
      ),
      undefined,
      iifeArgValues
    )
  )
}

const STUB_PACKAGE_REGEXP = /("|')(@3fv\/)?(\.\.\/\.\.\/src|jsx-control-statements|tsx-control-statements\/components)(\.ts)?("|')/
const getTransformation = (node: ts.Node): JsxTransformation => {
  const isStubsImport = ts.isImportDeclaration(node) && node.getChildren().some(
    child => STUB_PACKAGE_REGEXP.test(child.getFullText())
  )
  
  if (isStubsImport) {
    return (a, b, c) => ts.createEmptyStatement()
  }
  
  if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) {
    return (a, b, c) => a
  }
  
  const tagName = getTagNameString(node as ts.JsxElement)
  switch (tagName) {
    case CTRL_NODE_NAMES.CONDITIONAL:
      return transformIfNode
    case CTRL_NODE_NAMES.FOREACH:
      return transformForNode
    case CTRL_NODE_NAMES.SWITCH:
      return transformChooseNode
    case CTRL_NODE_NAMES.WITH:
      return transformWithNode
    default:
      return (a, b, c) => a
  }
}

const statements: Transformation = (node, program, ctx) =>
  (getTransformation(node) as Transformation)(node, program, ctx)
// Option.of((
//   getTransformation(node) as Transformation
// )(node, program, ctx))
//   .map(newNode => !newNode ? undefined : !ts.isJsxExpression(newNode)  &&
//   getValue(() => ts.isJsxExpression(((newNode as any).expression))) ? (newNode as any).expression : newNode)
//   .get()
