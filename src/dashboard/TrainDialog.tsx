import React from 'react'
import { trainAgent } from '../web-worker/service'
import Card from './Card'
import CardHeader from './CardHeader'
import CardContent from './CardContent'
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from './Button'
import { TrainingProgressMessage } from '../web-worker/protocol'
import SplinePlot from './SplinePlot'

export type TrainDialogProps = any

export type TrainDialogState = {
  epochAndYMetric: { x: number; y: number; yDev: number }[]
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
      epochAndYMetric: [],
      doneTraining: false,
      isTraining: false,
      cancelFn: () => { },
    }
  }

  callTrainAgent = () => {
    const agentName = 'Fred'
    const agentType = 'guru'
    const epochs = 9000
    const onProgress = this.trainingCallback
    const simplified = true
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
        cancelFn: () => { },
      })
    })
    this.setState({ cancelFn: promise.cancel, isTraining: true })
  }

  trainingCallback = (snapshot: TrainingProgressMessage) => {
    console.log(snapshot)
    this.setState(state => {
      state.epochAndYMetric.push({
        x: snapshot.epoch,
        y: parseFloat(snapshot.agent.meanPerformance.toPrecision(4)),
        yDev: snapshot.agent.stdDevPerformance,
      })
      return { epochAndYMetric: state.epochAndYMetric }
    })
  }

  stopTraining = () => {
    const { cancelFn } = this.state
    cancelFn()
    this.setState({
      isTraining: false,
      doneTraining: true,
      cancelFn: () => { },
    })
  }

  render() {
    const { epochAndYMetric, doneTraining, isTraining } = this.state
    const data = [
      {
        id: 'line',
        data: epochAndYMetric,
        color: '#000000',
      },
      {
        id: 'lowerCI',
        data: epochAndYMetric.map(point => {
          return { x: point.x, y: point.y - point.yDev }
        }),
        color: '#999999',
      },
      {
        id: 'upperCI',
        data: epochAndYMetric.map(point => {
          return { x: point.x, y: point.y + point.yDev }
        }),
        color: '#999999',
      },
    ]
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
      <Button
        text="Cancel"
        onClick={this.stopTraining}
        disabled={epochAndYMetric.length <= 1}
        variant="danger"
      />
    ) : (
          <Button text="Train Agent" onClick={this.callTrainAgent} />
        )
    return (
      <Card>
        <CardHeader>Train New Agent</CardHeader>
        <CardContent
          style={{
            height: '400px',
            fontSize: '14px',
            fontFamily: 'sans-serif',
          }}
        >
          <SplinePlot
            data={data}
            minY={-0.7}
            maxY={0.7}
            yAxisTitle={'average performance'}
          />
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
