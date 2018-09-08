import React from 'react'

import Card from '@material-ui/core/Card'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import FormLabel from '@material-ui/core/FormLabel'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'

import { withStyles } from '@material-ui/core/styles'
import { RadioGroup } from '@material-ui/core'
import { Radio } from '@material-ui/core'

type DashboardProps = {
  classes: { [K in keyof typeof styles]: string }
}

type DashboardState = {
  running: boolean
  logs: Map<string, any>
  config: {
    transferLearning: boolean
    selectedLog: string | null
    online: boolean
    suitCount: number
    gameCount: number
    agentType:
      | 'contextless'
      | 'suit-counting'
      | 'card-counting'
      | 'context-learning'
    scenario: 'simplified' | 'complete'
  }
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
      running: false,
      logs: new Map(),
      config: {
        transferLearning: false,
        selectedLog: null,
        online: true,
        suitCount: 4,
        gameCount: 200,
        agentType: 'contextless',
        scenario: 'simplified',
      },
    }
  }

  renderLearningOptions() {
    const { classes } = this.props
    const {
      config: { transferLearning, online },
    } = this.state
    return (
      <FormControl className={classes.padded}>
        <FormLabel>Learning</FormLabel>
        <FormControlLabel
          label="Transfer Learning"
          checked={transferLearning}
          onChange={(event: any) => {
            const value = event.target.checked
            this.setState(state => ({
              config: {
                ...state.config,
                transferLearning: value,
              },
            }))
          }}
          control={<Checkbox />}
        />
        {transferLearning ? (
          <FormControl>
            <InputLabel id="Prior Learning">Prior Learning</InputLabel>
            <Select
              native
              disabled
              inputProps={{
                id: 'Prior Learning',
                name: 'Prior Learning',
              }}
            />
          </FormControl>
        ) : (
          <FormControl>
            <TextField
              required
              label="Instance Name"
              inputProps={{
                id: 'instance Name',
                name: 'instanceName',
              }}
            />
          </FormControl>
        )}
        <FormControlLabel
          label="Online"
          checked={online}
          onChange={(event: any) => {
            const value = event.target.checked
            console.log(Object.keys(event.target))
            console.log(event.target)
            this.setState(state => ({
              config: {
                ...state.config,
                online: value,
              },
            }))
          }}
          control={<Checkbox />}
        />
      </FormControl>
    )
  }

  renderScaleOptions() {
    const { classes } = this.props
    const {
      config: { gameCount, suitCount },
    } = this.state
    const onChange = (key: any) => (event: any) => {
      const value = event.target.value
      this.setState(state => ({
        config: {
          ...state.config,
          [key]: value,
        },
      }))
    }
    return (
      <FormControl className={classes.padded}>
        <FormLabel>Scale</FormLabel>
        <FormControl>
          <TextField
            onChange={onChange('gameCount')}
            label="Games"
            value={gameCount}
            type="number"
          />
        </FormControl>
        <FormControl>
          <TextField
            onChange={onChange('colorCount')}
            label="suits"
            value={suitCount}
            type="number"
          />
        </FormControl>
      </FormControl>
    )
  }

  renderBehaviorOptions() {
    const { classes } = this.props
    return (
      <FormControl className={classes.padded}>
        <FormLabel>Agent Behavior</FormLabel>
        <RadioGroup
          value={this.state.config.agentType}
          onChange={(event: any) => {
            const behavior = event.target.value
            this.setState(state => ({
              config: {
                ...state.config,
                agentType: behavior,
              },
            }))
          }}
        >
          <FormControlLabel
            value="contextless"
            control={<Radio />}
            label="Contextless"
          />
          <FormControlLabel
            value="suit-counting"
            control={<Radio />}
            label="Suit Counting"
          />
          <FormControlLabel
            value="card-counting"
            control={<Radio />}
            label="Card Counting"
          />
          <FormControlLabel
            value="context-learning"
            control={<Radio />}
            label="Context Learning"
          />
        </RadioGroup>
      </FormControl>
    )
  }

  renderScenarioOptions() {
    const { classes } = this.props
    return (
      <FormControl className={classes.padded}>
        <FormLabel>Game Scenario</FormLabel>
        <RadioGroup
          value={this.state.config.scenario}
          onChange={(event: any) => {
            const scenario = event.target.value
            this.setState(state => ({
              config: {
                ...state.config,
                scenario: scenario,
              },
            }))
          }}
        >
          <FormControlLabel
            value="simplified"
            control={<Radio />}
            label="Simplified"
          />
          <FormControlLabel
            value="complete"
            control={<Radio />}
            label="Complete"
          />
        </RadioGroup>
      </FormControl>
    )
  }

  render() {
    const { classes } = this.props
    return (
      <Card className={classes.card}>
        {this.renderLearningOptions()}
        {this.renderBehaviorOptions()}
        {this.renderScenarioOptions()}
        {this.renderScaleOptions()}
      </Card>
    )
  }
}

export default withStyles(styles)(Dashboard)
