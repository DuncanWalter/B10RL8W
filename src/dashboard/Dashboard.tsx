import React from 'react'

import { withStyles } from '@material-ui/core/styles'

import NavBar from './NavBar'
import TrainDialog, { TrainDialogProps } from './TrainDialog'
import EvalDialog, { EvalDialogProps } from './EvalDialog'
import ResultDialog, { ResultDialogProps } from './ResultDialog'
import WelcomeDialog, { WelcomeDialogProps } from './WelcomeDialog'
import { styles, Classes } from './styles'

type DashboardState = {
  activeDialog: number
  dialogs: (
    | { props: TrainDialogProps; type: 'train' }
    | { props: EvalDialogProps; type: 'eval' }
    | { props: ResultDialogProps; type: 'result' }
    | { props: WelcomeDialogProps; type: 'welcome' })[]
  // map of trained agents by 'id'
  // map of results by ['id1', 'id2', 'id3', 'id4']
}

export type DashboardProps = { classes: Classes }

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props)
    this.state = {
      activeDialog: 0,
      dialogs: [
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

  createNewTrainDialog = () => {
    const { dialogs } = this.state
    const props = {}
    const activeDialog = dialogs.length
    this.setState({
      activeDialog,
      dialogs: dialogs.concat([{ type: 'train', props }]),
    })
  }

  createNewEvalDialog = () => {
    const { dialogs } = this.state
    const props = {}
    const activeDialog = dialogs.length
    this.setState({
      activeDialog,
      dialogs: dialogs.concat([{ type: 'eval', props }]),
    })
  }

  switchDialog = (index: number) => {
    const { dialogs } = this.state
    this.setState({
      activeDialog: index,
      dialogs,
    })
  }

  deleteDialog = (index: number) => {
    const { dialogs } = this.state
    dialogs.splice(index, 1)
    this.setState({
      activeDialog: 0,
      dialogs,
    })
  }

  renderNavBar() {
    const items = this.state.dialogs.map(({ type }, i) => {
      const description = `${type} (${i})`
      const onClick = () => this.switchDialog(i)
      return { description, onClick }
    })
    const addTrainDialogItem = {
      description: 'Train New Agent',
      onClick: this.createNewTrainDialog,
    }
    const addEvalDialogItem = {
      description: 'Evaluate New Set of Agents',
      onClick: this.createNewEvalDialog,
    }
    items.push(addTrainDialogItem)
    items.push(addEvalDialogItem)
    return <NavBar entries={items} />
  }

  renderDialog(index: number) {
    const dialogProps = this.state.dialogs[index]

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

    return dialog
  }

  render() {
    const { classes } = this.props
    const { activeDialog } = this.state
    return (
      <div className={classes.root}>
        <div className={classes.split}>
          <div style={{ flexGrow: 0 }}>{this.renderNavBar()}</div>

          <div style={{ flexGrow: 1 }}>{this.renderDialog(activeDialog)}</div>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(Dashboard)
