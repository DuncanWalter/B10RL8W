import React from 'react'
import { trainAgent } from '../web-worker/service'
import Card from './Card'
import CardHeader from './CardHeader'
import CardContent from './CardContent'
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from './Button'
import { TrainingProgressMessage } from '../web-worker/protocol'
import SplinePlot from './SplinePlot'
import { Typography } from '@material-ui/core'

export type TrainDialogProps = any

export type Point = {
  x: number
  y: number
}

export type Line = {
  lines: {
    color: string
    data: Point[]
    id?: string
  }[]
  append(x: number, y: number, d: number): void
}

function line(id: string, color: string, errorColor: string): Line {
  return {
    lines: [
      {
        color: errorColor,
        data: [],
      },
      {
        id,
        color,
        data: [],
      },
      {
        color: errorColor,
        data: [],
      },
    ],
    append(x, y, d) {
      if (!y && y !== 0) {
        return
      }
      const [min, mid, max] = this.lines
      mid.data.push({ x, y })
      min.data.push({ x, y: y - d })
      max.data.push({ x, y: y + d })
    },
  }
}

export type TrainDialogState = {
  // epochAndYMetric: { x: number; y: number; yDev: number }[]

  agentPerformance: Line
  heuristicPerformance: Line
  randomPerformance: Line

  agentScore: Line
  heuristicScore: Line
  randomScore: Line

  agentLoss: Line

  doneTraining: boolean
  isTraining: boolean
  cancelFn: () => void
}

export default class TrainDialog extends React.Component<
  TrainDialogProps,
  TrainDialogState
> {
  constructor(props: TrainDialogProps) {
    super(props)
    this.state = {
      agentLoss: line('Agent Loss', '#111111', '#aaaabb'),
      agentPerformance: line('Agent Perf', '#111111', '#aaaabb'),
      heuristicPerformance: line('Hugo Perf', '#ff1111', '#ffaabb'),
      randomPerformance: line('Random Perf', '#1111ff', '#aaaaff'),
      agentScore: line('Agent Score', '#111111', '#aaaabb'),
      heuristicScore: line('Hugo Score', '#ff1111', '#ffaabb'),
      randomScore: line('Random Score', '#1111ff', '#aaaaff'),
      doneTraining: false,
      isTraining: false,
      cancelFn: () => {},
    }
  }

  callTrainAgent = () => {
    const agentName = 'Fred'
    const agentType = 'rule-tracking'
    const epochs = 5000
    const onProgress = this.trainingCallback
    const simplified = false
    const promise = trainAgent({
      agentName,
      agentType,
      epochs,
      onProgress,
      simplified,
    })
    promise.then(() => {
      this.setState({
        doneTraining: true,
        isTraining: false,
        cancelFn: () => {},
      })
    })
    this.setState({ cancelFn: promise.cancel, isTraining: true })
  }

  trainingCallback = (snapshot: TrainingProgressMessage) => {
    const { epoch, agent, heuristic, random, agentLoss: loss } = snapshot
    this.setState(state => {
      const {
        agentLoss,
        agentPerformance,
        agentScore,
        heuristicPerformance,
        heuristicScore,
        randomPerformance,
        randomScore,
      } = state
      agentLoss.append(epoch, loss, 1)
      agentPerformance.append(
        epoch,
        agent.meanPerformance,
        agent.stdDevPerformance,
      )
      agentScore.append(epoch, agent.meanScore, agent.stdDevScore)
      heuristicPerformance.append(
        epoch,
        heuristic.meanPerformance,
        heuristic.stdDevPerformance,
      )
      heuristicScore.append(epoch, heuristic.meanScore, heuristic.stdDevScore)
      randomPerformance.append(
        epoch,
        random.meanPerformance,
        random.stdDevPerformance,
      )
      randomScore.append(epoch, random.meanScore, random.stdDevScore)
      return {}
    })
  }

  stopTraining = () => {
    const { cancelFn } = this.state
    cancelFn()
    this.setState({
      isTraining: false,
      doneTraining: true,
      cancelFn: () => {},
    })
  }

  render() {
    const {
      agentLoss,
      agentPerformance,
      agentScore,
      heuristicPerformance,
      heuristicScore,
      randomPerformance,
      randomScore,
      doneTraining,
      isTraining,
    } = this.state
    const activityIndicator = isTraining ? (
      <CardContent>
        <LinearProgress />
      </CardContent>
    ) : (
      undefined
    )
    const rightButton = doneTraining ? (
      undefined
    ) : isTraining ? (
      <Button text="Cancel" onClick={this.stopTraining} variant="danger" />
    ) : (
      <Button text="Train Agent" onClick={this.callTrainAgent} />
    )
    return (
      <Card>
        <CardHeader>Train New Agent</CardHeader>
        <CardContent
          style={{
            fontSize: '14px',
            fontFamily: 'sans-serif',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="title">Performance vs Epoch</Typography>
          <div style={{ height: '400px', width: '100%' }}>
            <SplinePlot
              data={[
                ...agentPerformance.lines,
                ...heuristicPerformance.lines,
                ...randomPerformance.lines,
              ]}
              yAxisTitle={'average performance'}
            />
          </div>
          <Typography variant="body1">
            A plot of the average performance of the agent when evaluated for
            several games in a variety of seating arrangements against random
            and heuristic opponents at regular intervals during training.
            Performance is a metric capped between negative one and one which
            measures how well agents rank against opponents. Higher performances
            are achieved by winning more.
          </Typography>
        </CardContent>
        <CardContent
          style={{
            fontSize: '14px',
            fontFamily: 'sans-serif',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="title">Score vs Epoch</Typography>
          <div style={{ height: '400px', width: '100%' }}>
            <SplinePlot
              data={[
                ...agentScore.lines,
                ...heuristicScore.lines,
                ...randomScore.lines,
              ]}
              yAxisTitle={'average score'}
            />
          </div>
          <Typography variant="body1">
            A plot of the average score of the agent when evaluated for several
            games in a variety of seating arrangements against random and
            heuristic opponents at regular intervals during training. Lower
            scores indicate better play.
          </Typography>
        </CardContent>
        <CardContent
          style={{
            fontSize: '14px',
            fontFamily: 'sans-serif',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="title">Loss vs Epoch</Typography>
          <div style={{ height: '400px', width: '100%' }}>
            <SplinePlot
              data={[...agentLoss.lines]}
              minY={0}
              yAxisTitle={'loss'}
            />
          </div>
          <Typography variant="body1">
            A plot of a running average of the training agent's loss throughout
            training. Lower loss values are generally good, but do not measure
            the agent's actual behavior in a meaningful way.
          </Typography>
        </CardContent>
        {activityIndicator}
        <CardContent style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button text="Dismiss" />
          {rightButton}
        </CardContent>
      </Card>
    )
  }
}
