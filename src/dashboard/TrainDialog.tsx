import React from 'react'
import { trainAgent } from '../web-worker/service'
import Card from './Card'
import CardHeader from './CardHeader'
import CardContent from './CardContent'
import Typography from '@material-ui/core/Typography'
import Button from './Button'
import { maxSatisfying } from 'semver'

export type TrainDialogProps = any

export default class TrainDialog extends React.Component<TrainDialogProps> {
  callTrainAgent() {
    const agentName = 'Fred'
    const agentType = 'contextless'
    const epochs = 10
    const onProgress = (
      snapshots: {
        epoch: number
      }[],
    ) => {
      const lastEpoch = snapshots
        .map(({ epoch }) => epoch)
        .reduce((acc, curr) => (curr > acc ? curr : acc))
      console.log(lastEpoch)
      if (lastEpoch > epochs) {
        console.log('Done training!')
      }
    }
    const simplified = true
    trainAgent({ agentName, agentType, epochs, onProgress, simplified })
    console.log('Sent off to train agent')
  }

  render() {
    return (
      <Card>
        <CardHeader>Train New Agent</CardHeader>
        <CardContent>
          <Typography variant="body1">
            This is some dummy text to indicate that this is all working
          </Typography>
        </CardContent>
        <CardContent>
          <Typography variant="body1">{}</Typography>
        </CardContent>
        <CardContent style={{ display: 'flex', justifyContent: 'flex' }}>
          <Button text="Train Agent" onClick={this.callTrainAgent} />
        </CardContent>
        <CardContent style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button text="Dismiss" />
        </CardContent>
      </Card>
    )
  }
}
