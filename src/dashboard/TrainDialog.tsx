import React from 'react'
import { trainAgent } from '../web-worker/service'
import Card from './Card'
import CardHeader from './CardHeader'
import CardContent from './CardContent'
import Typography from '@material-ui/core/Typography'
import Button from './Button'
import { TrainingProgressMessage } from '../web-worker/protocol'
import SplinePlot from './SplinePlot';

export type TrainDialogProps = any

// TODO this will get moved to the results/eval dialog later
export type TrainDialogState = {
  epochAndYMetric: { x: number; y: number }[]
  doneTraining: boolean
}

export default class TrainDialog extends React.Component<
  TrainDialogProps,
  TrainDialogState
  > {
  constructor(props: TrainDialogProps) {
    super(props)
    this.state = {
      epochAndYMetric: [],
      doneTraining: false,
    }
  }

  callTrainAgent = () => {
    const agentName = 'Fred'
    const agentType = 'contextless'
    const epochs = 500
    const onProgress = this.trainingCallback
    const simplified = true
    trainAgent({ agentName, agentType, epochs, onProgress, simplified }).then(
      () => {
        this.setState({ doneTraining: true })
      },
    )
  }

  trainingCallback = (snapshot: TrainingProgressMessage) => {
    console.log(snapshot)
    this.setState(state => {
      state.epochAndYMetric.push({
        x: snapshot.epoch,
        y: parseFloat(snapshot.agent.meanPerformance.toPrecision(4)),
      })
      return { epochAndYMetric: state.epochAndYMetric }
    })
  }

  render() {
    const { epochAndYMetric, doneTraining } = this.state
    const data = [{
      id: 'line',
      data: epochAndYMetric,
    },
    {
      id: 'lowerCI',
      data: epochAndYMetric.map(point => {
        return { x: point.x, y: point.y - 0.05 }
      })
    },
    {
      id: 'upperCI',
      data: epochAndYMetric.map(point => {
        return { x: point.x, y: point.y + 0.05 }
      }),
    }]
    const doneMessage = doneTraining ? (
      <CardContent>
        <Typography variant="body1">We have completed training!</Typography>
      </CardContent>
    ) : (
        undefined
      )

    return (
      <Card>
        <CardHeader>Train New Agent</CardHeader>
        <CardContent style={{
          height: '400px', fontSize: '14px',
          fontFamily: "sans-serif"
        }}>
          <SplinePlot data={data}>
          </SplinePlot>
        </CardContent>
        {doneMessage}
        <CardContent style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button text="Dismiss" />
          <Button text="Train Agent" onClick={this.callTrainAgent} />
        </CardContent>
      </Card >
    )
  }
}
