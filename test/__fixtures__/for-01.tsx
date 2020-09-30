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

export interface For01Props {
  classes: ClassNameMap
}

export const For01 = React.memo(function IssueListItem(props: For01Props) {
  const { classes, ...other } = props,
    issue = {
      title: "title"
    },
    isEnabled = false,
    info: any = null,
    selected = true,
    style = {}
  //classes = useStyles(props) as any,

  //useEffect(() => setPrefix(generateId()), [oc(issue).id()])

  // noinspection PointlessBooleanExpressionJS
  return (
    <Choose>
      <When condition={!issue}>
        <div style={style} className={classes.root} {...other} />
      </When>
      <Otherwise>
        <Hello enabled={isEnabled}/>
        <Hello2 enabled={!isEnabled}/>
        <div style={style} className={classes.root} {...other}>
          <If condition={!info}>
            <Divider
              classes={{
                root: clsx(classes.divider, {
                  selected,
                  [classes.unselected]: !selected,
                  [classes.selected]: selected
                })
              }}
            />
          </If>
          <div
            className={clsx(classes.content, {
              [classes.isHeader]: false
            })}
            onDoubleClick={() => {
              alert("double")
            }}
          >
            <If condition={!!isEnabled}>
              <Box className={clsx(classes.left)}>
                <Typography
                  classes={{
                    root: clsx(classes.state)
                  }}
                  variant="h1"
                >
                  hello
                </Typography>
              </Box>
            </If>

            <div className={clsx(classes.main)}>
              <If condition={isEnabled}>
                <ul
                  className={clsx(classes.top, {
                    selected,
                    [classes.selected]: selected
                  })}
                >
                  <If condition={isEnabled}>
                    <Typography key="name" className={clsx(classes.name)} />
                  </If>

                  <If condition={isEnabled}>
                    <Typography key="number" className={clsx(classes.number)} />
                  </If>

                  <If condition={selected && !isEnabled}>
                    <Typography
                      key="caption"
                      className={clsx(classes.caption)}
                    />
                  </If>
                </ul>
              </If>

              <If condition={Date.now() > 0}>
                <Typography key="always" className={clsx(classes.always)} />
              </If>
            </div>

            <If condition={selected && isEnabled}>
              <div className={clsx(classes.container)}>
                <Choose>
                  <When condition={!selected}>
                    <Typography className={clsx(classes.placeholder)}>
                      Placeholder
                    </Typography>
                  </When>
                  <When condition={selected && isEnabled}>
                    test
                    <div />
                    <br />
                    1234
                  </When>
                  <Otherwise>
                    test
                    <div />
                    <br />
                    1234
                  </Otherwise>
                </Choose>
              </div>
            </If>
          </div>
        </div>
      </Otherwise>
    </Choose>
  )
})

function Items({ enabled, count }: { enabled: boolean; count: number }) {
  const items = (
    <For
      of={range(0, 100)}
      body={(num: number) => (
        <If key={num} condition={count % (enabled ? 2 : 1) === 0}>
          Number: {num}
        </If>
      )}
    />
  )

  return <If condition={Date.now() > 0}>
    {items}
    <If condition={enabled}>END</If>
  </If>

}

function Hello({ enabled }: { enabled: boolean; }) {
  return <If condition={!!enabled}>
    <Typography>Hello</Typography>
  </If>
  
}

function Hello2({ enabled }: { enabled: boolean }) {
  
  const internalChoose = <Choose>
    <When condition={!!enabled}><>Enabled</></When>
    <Otherwise>
      <>Not Enabled</>
    </Otherwise>
  </Choose>
  
  return (
    <div>
      {internalChoose}
    </div>
  )
  
}


export default For01
