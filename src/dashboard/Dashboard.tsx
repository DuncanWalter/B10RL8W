import React from 'react'
import Card from '@material-ui/core/Card'
import { withStyles } from '@material-ui/core/styles'

import { NavBar } from './NavBar'
import { TrainDialogProps, TrainDialog } from './TrainDialog'
import { EvalDialogProps, EvalDialog } from './EvalDialog'
import { ResultDialogProps, ResultDialog } from './ResultDialog'
import { WelcomeDialogProps, WelcomeDialog } from './WelcomeDialog'

type DashboardProps = {
  classes: { [K in keyof typeof styles]: string }
}

type DashboardState = {
  openDialog: number
  dialogsProps: (
    | { props: TrainDialogProps; type: 'train' }
    | { props: EvalDialogProps; type: 'eval' }
    | { props: ResultDialogProps; type: 'result' }
    | { props: WelcomeDialogProps; type: 'welcome' })[]
  // map of trained agents by 'id'
  // map of results by ['id1', 'id2', 'id3', 'id4']
}

const styles = {
  padded: {
    padding: '24px',
  },
  card: {
    margin: '12px',
  },
  cardHeader: {
    padding: '24px',
  },
  cardContent: {
    padding: '0 24px 24px',
  },
}

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props)
    this.state = {
      openDialog: 0,
      dialogsProps: [
        {
          type: 'welcome',
          props: {
            message:
              "The Path to a Man's Heart(s) is Through His Neural Network?",
          },
        },
      ],
    }
  }

  renderNavBar() {
    const items = [
      { description: 'Hello there', onClick: () => {} },
      { description: 'General Kenobi', onClick: () => {} },
    ]
    return <NavBar entries={items} />
  }

  renderDialog(index: number) {
    const { classes } = this.props
    const dialogProps = this.state.dialogsProps[index]

    let dialog

    switch (dialogProps.type) {
      case 'train': {
        dialog = <TrainDialog />
        break
      }
      case 'eval': {
        dialog = <EvalDialog />
        break
      }
      case 'result': {
        dialog = <ResultDialog />
        break
      }
      case 'welcome': {
        dialog = <WelcomeDialog message={dialogProps.props.message} />
        break
      }
      default: {
        const never: never = dialogProps
        break
      }
    }

    return <Card className={classes.card}>{dialog}</Card>
  }

  render() {
    const { classes } = this.props
    const { openDialog } = this.state
    return (
      <Card className={classes.card}>
        {this.renderNavBar()}
        {this.renderDialog(openDialog)}
      </Card>
    )
  }
}

export default withStyles(styles)(Dashboard)
