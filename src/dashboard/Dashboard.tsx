import React from 'react'
import Card from '@material-ui/core/Card'
import {
  withStyles,
  Theme,
  createStyles,
  WithStyles,
} from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'

import { NavBar } from './NavBar'
import TrainDialog, { TrainDialogProps } from './TrainDialog'
import EvalDialog, { EvalDialogProps } from './EvalDialog'
import ResultDialog, { ResultDialogProps } from './ResultDialog'
import WelcomeDialog, { WelcomeDialogProps } from './WelcomeDialog'

// type DashboardProps = {
//   classes: { [K in keyof typeof styles]: string }
// }

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

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: 440,
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawerPaper: {
      position: 'relative',
      width: '240px',
    },
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing.unit * 3,
      minWidth: 0,
    },
    toolbar: theme.mixins.toolbar,

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
  })
interface DashboardProps extends WithStyles<typeof styles> {}

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
    const { classes } = this.props
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

    return <Card className={classes.card}>{dialog}</Card>
  }

  render() {
    const { classes } = this.props
    const { activeDialog } = this.state
    // return (
    //   <div className={classes.root}>
    //     {/* <AppBar position="absolute" className={classes.appBar}> */}
    //     <Toolbar>
    //       <Typography variant="title" color="inherit" noWrap>
    //         Clipped drawer
    //       </Typography>
    //     </Toolbar>
    //     {/* </AppBar> */}
    //     {this.renderNavBar()}
    //     <main className={classes.content}>
    //       <div className={classes.toolbar}>
    //         {this.renderDialog(activeDialog)}
    //       </div>
    //     </main>
    //   </div>
    // )
    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar>
            <Typography variant="title" color="inherit" noWrap>
              Clipped drawer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar} />
          <Divider />
          {this.renderNavBar()}
          <Divider />
          {/* <List>{otherMailFolderListItems}</List> */}
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Typography noWrap>
            {'You think water moves fast? You should see ice.'}
          </Typography>
        </main>
      </div>
    )
  }
}

export default withStyles(styles)(Dashboard)
