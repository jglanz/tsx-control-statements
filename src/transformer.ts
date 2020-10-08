import * as ts from "typescript"
import { EmitHint, isJsxExpression } from "typescript"
import { Option } from "@3fv/prelude-ts"
import { match, when } from "ts-pattern"

const Kind = ts.SyntaxKind,
  F = ts.factory,
  isDev = !!process.env.TSX_CONTROL_DEBUG

const log = Option.tryNullable(() => {
  const Fs = require("fs")
  return require("tracer").colorConsole({
    transport: [
      function (data) {
        Fs.appendFile("./test.log", data.rawoutput + "\n", err => {
          if (err) throw err
        })
      },
      // console.log
    ]
  })
}).getOrElse(console)

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
  omitTrailingSemicolon: true
})

export default function transformer(
  program: ts.Program
): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) =>
    visitNodes(file, program, context)
}

function visitNodes(
  file: ts.SourceFile,
  program: ts.Program,
  context: ts.TransformationContext
): ts.SourceFile
function visitNodes(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext
): ts.Node
function visitNodes(
  node: ts.Node,
  program: ts.Program,
  context: ts.TransformationContext
) {
  const newNode = statements(node, program, context)
  if (node !== newNode) {
    return newNode
  }

  return ts.visitEachChild(
    node,
    childNode => visitNodes(childNode, program, context),
    context
  )
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
) => Readonly<R>

type Transformation = TS<ts.Node>
type JsxTransformation = TS<ts.JsxElement>

const wrapExpression = <T extends ts.Node = any>(
  parent: ts.Node,
  node: T
): ts.Node =>
  match(parent)
    .with(
      {
        kind: when(it =>
          [
            Kind.JsxElement,
            Kind.JsxOpeningElement,
            Kind.JsxClosingElement,
            Kind.JsxClosingFragment,
            Kind.JsxOpeningFragment,
            Kind.JsxFragment
          ].includes(it)
        )
      },
      () => node
    )
    .otherwise(
      () =>
        (node as any).expression ??
        (F.createJsxFragment(
          F.createJsxOpeningFragment(),
          (Array.isArray(node) ? node : [node]) as any,
          F.createJsxJsxClosingFragment()
        ) as any)
    )
//ts.isJsxElement(parent) || ts.isJsxExpression(parent) ? node : (node as any).expression ?? node

const isRelevantJsxNode = (node: ts.Node): node is ts.JsxElement =>
  [
    ts.isJsxElement,
    ts.isJsxSelfClosingElement,
    ts.isJsxExpression,
    ts.isJsxOpeningLikeElement,
    ts.isJsxFragment,
    ts.isJsxText
  ].some(test => test(node))
// ts.isJsxElement(node) ||
// ts.isJsxFragment(node) ||
// ts.isJsxSelfClosingElement(node) ||
// ts.isJsxExpression(node) ||
// ts.isJsxText(node) //&& node.getText() !== '';

const getTagNameString = (node: ts.Node): string => {
  if (ts.isJsxSelfClosingElement(node)) {
    return node.tagName?.getFullText()
  }

  const maybeOpeningElement = node.getChildAt(0) as ts.JsxOpeningElement
  return maybeOpeningElement?.tagName?.getFullText()
}

const filterEmptyStrings = (node: any) =>
  !(ts.isJsxText(node) && trim(node.text).length === 0)

type PropMap = Readonly<ts.MapLike<ts.Expression>>
const getJsxProps = (node: ts.JsxElement): PropMap => {
  const isOpening = ts.isJsxOpeningElement(node.getChildAt(0))
  const elementWithProps = isOpening ? node.getChildAt(0) : node

  const props = elementWithProps
    .getChildAt(2) // [tag (<), name (For, If, etc), attributes (...), tag (>)]
    .getChildAt(0) // some kinda ts api derp
    .getChildren()
    .filter(ts.isJsxAttribute)
    .map(x => ({
      [x.getChildAt(0).getText()]: x.getChildAt(2) as ts.Expression
    }))

  return Object.assign({}, ...props)
}
const nullJsxExpr = () =>
  F.createJsxExpression(undefined, F.createNull())

const newStringLiteral = (str: any) =>
  Option.ofNullable(trim(str))
    .filter(str => !!str && str.length > 0)
    .map(str =>
      str.startsWith("{") ? str : F.createStringLiteral(str)
    )
    .getOrCall(() => nullJsxExpr() as any)

const fixLiteralString = (node: any): any => {
  return node.kind === ts.SyntaxKind.JsxText && typeof node?.text === "string"
    ? newStringLiteral(node.text)
    : node?.expression?.kind === ts.SyntaxKind.JsxText &&
      typeof node?.expression?.text === "string"
    ? newStringLiteral(node.expression.text)
    : node
}

const sanitizeNodes = (nodeBody: ts.Node[]) =>
  Array.isArray(nodeBody)
    ? (nodeBody
        .filter(
          node =>
            !(
              ts.isLiteralTypeNode(node) &&
              typeof (node as any).literal === "string" &&
              trim((node as any).literal).length === 0
            )
        )
        .map(node =>
          !!(node as any).expression ? (node as any).expression : node
        )
        .map(fixLiteralString)
        .filter(
          node =>
            !(
              ts.isLiteralTypeNode(node) &&
              typeof (node as any).literal === "string" &&
              trim((node as any).literal).length === 0
            )
        ) as any)
    : nodeBody

const getJsxElementBody = (
  node: ts.Node,
  program: ts.Program,
  ctx: ts.TransformationContext
): ts.Expression[] =>
  node
    .getChildAt(1)
    .getChildren()
    .filter(isRelevantJsxNode)
    .map((node: ts.Node) => {
      const newNodes = visitNodes(node, program, ctx)
      if ((newNodes as any).length === 0) {
        log.warn("No children found")
      }
      return newNodes
    })
    .filter(filterEmptyStrings)
    .filter(Boolean) as ts.Expression[]

const trim = (from: string) =>
  from.replace(/^\r?\n[\s\t]*/, "").replace(/\r?\n[\s\t]*$/, "")

const createExpressionLiteral = (
  expressions: ts.Expression[]
): ts.ArrayLiteralExpression | ts.Expression =>
  expressions?.length === 1
    ? ts.isJsxText(expressions[0])
      ? F.createJsxExpression(undefined, expressions[0])
      : (expressions[0] as any)?.expression ?? expressions[0]
    : F.createArrayLiteralExpression(
        Option.of(Array.isArray(expressions) ? expressions : [expressions])
          .map(it =>
            it
              .map((node: any) => node?.expression ?? node)
              .map(fixLiteralString)
          )
          .get()
      )
const transformIfNode: JsxTransformation = (node, program, ctx) => {
  const { condition } = getJsxProps(node)
  if (!condition) {
    log.warn(
      `tsx-ctrl: ${CTRL_NODE_NAMES.CONDITIONAL} missing condition props`
    )
    return wrapExpression(node.parent, nullJsxExpr())
  }

  const body = getJsxElementBody(node, program, ctx)

  if (body?.length === 0) {
    log.warn(`tsx-ctrl: empty ${CTRL_NODE_NAMES.CONDITIONAL}`)
    return wrapExpression(node.parent, nullJsxExpr())
  }

  const newJsxExpression = F.createJsxExpression(
    undefined,
    F.createConditionalExpression(
      // condition,
      (condition as any)?.expression ?? condition,
      undefined,
      fixLiteralString(createExpressionLiteral(body)),
      undefined,
      ctx.factory.createNull()
    )
  )

  if (isDev) {
    const expressionOut = printer.printNode(
      EmitHint.Unspecified,
      newJsxExpression,
      node.getSourceFile()
    )
    log.info("New IF", expressionOut)
  }
  return wrapExpression(node.parent, newJsxExpression)
}

const makeArrayFromCall = (args: ts.Expression[]): ts.JsxExpression =>
  F.createJsxExpression(
    undefined,
    F.createCallExpression(
      F.createPropertyAccessExpression(
        F.createIdentifier("Array"),
        "from"
      ),
      undefined,
      args
    )
  )

const transformForNode: JsxTransformation = (node, program, ctx) => {
  const { each, of, index, body: functionLoopBody } = getJsxProps(node)
  if (!of) {
    log.warn(
      `tsx-ctrl: 'of' property of ${CTRL_NODE_NAMES.FOREACH} is missing`
    )
    return wrapExpression(node.parent, nullJsxExpr())
  }

  if (functionLoopBody) {
    const func = Option.of(functionLoopBody.getChildAt(1))
      .map(func =>
        func.kind === ts.SyntaxKind.ParenthesizedExpression
          ? (func as any).expression ?? func
          : func
      )
      .get()
    if (
      ts.isIdentifierOrPrivateIdentifier(func) ||
      ts.isFunctionLike(func) ||
      ts.isArrowFunction(func) ||
      ts.isFunctionExpression(func)
    ) {
      const transformedFunc = (visitNodes(func, program, ctx) as any) as ts.Node

      const result = makeArrayFromCall([
        fixLiteralString((of as any)?.expression ?? of),
        transformedFunc as any //(transformedFunc as any)?.expression ?? transformedFunc
      ])

      if (isDev) {
        const bodyOut = printer.printNode(
          EmitHint.Unspecified,
          result,
          node.getSourceFile()
        )
        log.info(`Transformed function body: ` + bodyOut)
      }

      return wrapExpression(node.parent, result)
    }
  }

  const body: any = getJsxElementBody(node, program, ctx)

  // if ((body as any)?.length === 0) {
  //   log.warn(`tsx-ctrl: Empty ${CTRL_NODE_NAMES.FOREACH}`)
  //   return nullJsxExpr()
  // }

  const arrowFunctionArgs = [each, index]
    .map(
      arg =>
        arg &&
        F.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          arg.getText().slice(1, -1)
        )
    )
    .filter(Boolean)

  const arrowFunction = F.createArrowFunction(
    undefined,
    undefined,
    arrowFunctionArgs,
    undefined, // type
    undefined,

    body
    //   body.length === 1 && (ts.isJsxText(body[0]) || getValue(() => ts.isJsxText((body[0] as any)?.expression))) ?
    // fixLiteralString(body[0]) as any : createExpressionLiteral(body)
  )

  const newJsxExpression = makeArrayFromCall([
    Option.of((of as any)?.expression ?? of)
      //.map(of => ts.isJsxExpression(of) ? fixLiteralString(of) : of)
      .get(),
    arrowFunction
  ])

  if (isDev) {
    const expressionOut = printer.printNode(
      EmitHint.Unspecified,
      newJsxExpression,
      node.getSourceFile()
    )
    log.info("New FOR", expressionOut)
    // if (expressionOut.includes("(),")) {
    //   debugger
    // }
  }

  return wrapExpression(node.parent, newJsxExpression)
}

const transformChooseNode: JsxTransformation = (
  node: ts.Node,
  program: ts.Program,
  ctx: ts.TransformationContext
) => {
  const elements = (node
    .getChildAt(1)
    .getChildren()
    .filter(
      node =>
        isRelevantJsxNode(node) &&
        [CTRL_NODE_NAMES.CASE, CTRL_NODE_NAMES.DEFAULT].includes(
          getTagNameString(node)
        )
    ) as ts.JsxElement[])
    .map(node => {
      const tagName = getTagNameString(node)
      const { condition } = getJsxProps(node)
      const nodeBody = getJsxElementBody(node, program, ctx)

      return { condition, nodeBody, tagName }
    })
    .filter((container, index, array) => {
      if (container.nodeBody?.length === 0) {
        console.warn(`tsx-ctrl: Empty ${CTRL_NODE_NAMES.CASE} in ${node.getSourceFile().fileName}`)
        return false
      }
    
      if (!container.condition && container.tagName !== CTRL_NODE_NAMES.DEFAULT) {
        console.warn(
          `tsx-ctrl: ${CTRL_NODE_NAMES.CASE} without condition will be skipped in ${node.getSourceFile().fileName}`
        )
        return false
      }
    
      if (
        container.tagName === CTRL_NODE_NAMES.DEFAULT &&
        index !== array?.length - 1
      ) {
        console.log(
          `tsx-ctrl: ${CTRL_NODE_NAMES.DEFAULT} must be the last node in a ${CTRL_NODE_NAMES.SWITCH} element!`
        )
        return false
      }
    
      return true
    })

  if (elements?.length === 0) {
    log.warn(`tsx-ctrl: Empty ${CTRL_NODE_NAMES.SWITCH}`)
    return wrapExpression(node.parent, nullJsxExpr())
  }

  const last = elements[elements?.length - 1]
  const [cases, defaultCase] =
    last && last.tagName === CTRL_NODE_NAMES.DEFAULT
      ? [elements.slice(0, elements?.length - 1), last]
      : [elements, null]

  const defaultCaseOrNull = createExpressionLiteral(
    fixLiteralString(
      defaultCase
        ? Array.isArray(defaultCase.nodeBody)
          ? defaultCase.nodeBody.map((it: any) => it?.expression ?? it)
          : defaultCase.nodeBody
        : F.createNull()
    )
  )

  let caseIndex = cases?.length
  const newJsxExpression = F.createJsxExpression(
    undefined,
    cases.reduceRight(
      (conditionalExpr, { condition, nodeBody: providedNodeBody }) => {
        const nodeBody = providedNodeBody.map((it: any) =>
          it.kind === ts.SyntaxKind.ParenthesizedExpression && !!it.expression
            ? it.expression
            : it
        )
        //.filter(node => !(node.kind === 286 && !(node as any).literal && !(node as any).expression))
        // .map(node =>
        //   fixLiteralString(sanitizeNodes(fixLiteralString(node))))
        //
        if (isDev) {
          const conditionOut = printer.printNode(
            EmitHint.Unspecified,
            condition,
            node.getSourceFile()
          )
          log.warn(`Index: ${caseIndex}, Condition`, conditionOut)
          nodeBody.forEach((elem, bodyIdx) => {
            const out = printer.printNode(
              EmitHint.Unspecified,
              elem,
              node.getSourceFile()
            )
            log.warn(`Index: ${caseIndex}, Body Index: ${bodyIdx}`, out)
          })
        }

        const whenTrue = createExpressionLiteral(
          //sanitizeNodes(
            //fixLiteralString(
              nodeBody

              //      .filter((node:any) => !(node.kind === 286 && !(node as any).text && !(node as any).literal && !(node as any).expression))
            //)
          //)
        )

        if (isDev) {
          const currentConditionalOut = printer.printNode(
            EmitHint.Unspecified,
            conditionalExpr,
            node.getSourceFile()
          )
          log.warn(
            `Current conditional at index: ${caseIndex}`,
            currentConditionalOut
          )
          caseIndex--

          // if (currentConditionalOut.includes("(),")) {
          //   debugger
          // }
        }
        return F.createConditionalExpression(
          (condition as any)?.expression ?? condition,
          undefined,
          (isJsxExpression(whenTrue) ?
            whenTrue.getChildAt(1) :
            whenTrue) as any,
            
          // Option.of((whenTrue as any)?.expression ?? whenTrue)
          //   // .map((it:any) =>
          //   //   Array.isArray(it?.elements) ?
          //   //     Object.assign(it, {elements:it.elements.filter(filterEmptyStrings)}) :
          //   //   Array.isArray(it) ? it.filter(filterEmptyStrings) : it)
          //   .get(),
          undefined,
          conditionalExpr
        )
      },
      //?.expression
      fixLiteralString(
        Option.of(defaultCaseOrNull as any)
          .map(it =>
            Array.isArray(it)
              ? it.map((it: any) =>
                  it.kind === ts.SyntaxKind.ParenthesizedExpression &&
                  !!it.expression
                    ? it.expression
                    : it
                )
              : it
          )
          //.map(it => it?.expression ?? it)
          .get()
        // Option.of((defaultCaseOrNull as any))
        //  // .map(it => it?.expression ?? it)
        //   .map((it:any) =>
        //     Array.isArray(it?.elements) ?
        //       Object.assign(it, {elements:it.elements.filter(filterEmptyStrings)}) :
        //     Array.isArray(it) ? it.filter((node:any) => !(node.kind === 11 && trim(node.text).length === 0)) : it)
        //   .get()
      )
    )
  )

  if (isDev) {
    const expressionOut = printer.printNode(
      EmitHint.Unspecified,
      newJsxExpression,
      node.getSourceFile()
    )
    log.info("New CHOOSE", expressionOut)
  }
  return wrapExpression(node.parent, newJsxExpression)
}

const transformWithNode: JsxTransformation = (node, program, ctx) => {
  const props = getJsxProps(node)
  const iifeArgs = Object.keys(props).map(key =>
    F.createParameterDeclaration(undefined, undefined, undefined, key)
  )
  const iifeArgValues = Object.values(props)
  const body = getJsxElementBody(node, program, ctx) as ts.Expression[]

  return F.createJsxExpression(
    undefined,
    F.createCallExpression(
      F.createArrowFunction(
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
  const isStubsImport =
    ts.isImportDeclaration(node) &&
    node
      .getChildren()
      .some(child => STUB_PACKAGE_REGEXP.test(child.getFullText()))

  if (isStubsImport) {
    return (a, b, c) => F.createEmptyStatement()
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

