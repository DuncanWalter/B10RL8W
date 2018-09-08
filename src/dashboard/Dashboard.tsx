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
// TODO: WHY!?!?!?!?!
import { FormGroup, RadioGroup, Radio } from '@material-ui/core'

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
    agentCount: number
    colorCount: number
    gameCount: number
    agentType: 'hyper-focussed' | 'selfish' | 'generous'
    scenario: 'balanced' | 'scarcity' | 'poverty'
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
        agentCount: 5,
        colorCount: 2,
        gameCount: 200,
        agentType: 'selfish',
        scenario: 'balanced',
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
      config: { gameCount, agentCount, colorCount },
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
            onChange={onChange('agentCount')}
            label="Agents"
            value={agentCount}
            type="number"
          />
        </FormControl>
        <FormControl>
          <TextField
            onChange={onChange('colorCount')}
            label="Colors"
            value={colorCount}
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
            value="selfish"
            control={<Radio />}
            label="Selfish"
          />
          <FormControlLabel
            value="generous"
            control={<Radio />}
            label="Generous"
          />
          <FormControlLabel
            value="hyper-focussed"
            control={<Radio />}
            label="Hyper Focussed"
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
            value="balanced"
            control={<Radio />}
            label="Balanced"
          />
          <FormControlLabel
            value="scarcity"
            control={<Radio />}
            label="Scarcity"
          />
          <FormControlLabel
            value="poverty"
            control={<Radio />}
            label="Poverty"
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
