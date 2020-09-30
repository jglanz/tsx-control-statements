import { range } from "lodash"
import * as React from "react"
import { For } from "jsx-control-statements"
import { ClassNameMap } from "@material-ui/core/styles/withStyles"
import Typography from "@material-ui/core/Typography"

export interface For02Props {
  classes: ClassNameMap
}

export const For02 = React.memo(function IssueListItem(props: For02Props) {
  const { classes, ...other } = props,
    issue = {
      title: "title"
    },
    isEnabled = false,
    info: any = null,
    selected = true,
    style = {},
    renderItem = (num: number) => <Typography>{num}</Typography>
  
  return <For of={range(0,100)} body={renderItem}/>

})

export default For02
