import { range } from "lodash"
import * as React from "react"
import { useCallback, useMemo } from "react"

//import { oc } from "ts-optchain"
//import clsx from "clsx"

import clsx from "clsx"
import { If, Otherwise, When, Choose, For } from "jsx-control-statements"
import { ClassNameMap } from "@material-ui/core/styles/withStyles"
import { Divider } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"

export interface Choose01Props {
  classes: ClassNameMap
}

export const Choose01 = React.memo(function IssueListItem(props: Choose01Props) {
  const { classes, ...other } = props,
    isEnabled = false,
    info: any = null,
    selected = true,
    style = {},
    createNode = () => <div/>
  
    return <Choose>
    <When condition={1 === 1}>
      {createNode()}
    </When>
    
  </Choose>
  //classes = useStyles(props) as any,

  //useEffect(() => setPrefix(generateId()), [oc(issue).id()])

  // noinspection PointlessBooleanExpressionJS
  
})


export default Choose01
