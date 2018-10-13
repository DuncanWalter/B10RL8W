import React from 'react'
import { trainAgent } from '../web-worker/service'
import Card from './Card'
import CardHeader from './CardHeader'
import CardContent from './CardContent'
import Typography from '@material-ui/core/Typography'
import Button from './Button'
import { ResponsiveLine } from '@nivo/line'
import { TrainingProgressMessage } from '../web-worker/protocol'

export type TrainDialogProps = any

// TODO this will get moved to the results/eval dialog later
type TrainDialogState = {
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
        y: snapshot.agent.meanPerformance,
      })
      return { epochAndYMetric: state.epochAndYMetric }
    })
  }

  render() {
    const { epochAndYMetric, doneTraining } = this.state
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
        <CardContent style={{ height: '400px' }}>
          <ResponsiveLine
            data={[
              {
                id: 'main',
                data: epochAndYMetric,
              },
            ]}
            xScale={{
              type: 'point',
            }}
            yScale={{
              type: 'linear',
              stacked: false,
              min: 'auto',
              max: 'auto',
            }}
            minY="auto"
            maxY="auto"
            curve="natural"
            axisBottom={{
              orient: 'bottom',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'epochs',
              legendOffset: 36,
              legendPosition: 'center',
            }}
            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'average score',
              legendOffset: -40,
              legendPosition: 'center',
            }}
            dotSize={10}
            dotColor="inherit:darker(0.3)"
            dotBorderWidth={2}
            dotBorderColor="#ffffff"
            enableDotLabel={true}
            dotLabel="y"
            dotLabelYOffset={-12}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        </CardContent>
        {doneMessage}
        <CardContent style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button text="Dismiss" />
          <Button text="Train Agent" onClick={this.callTrainAgent} />
        </CardContent>
      </Card>
    )
  }
}
