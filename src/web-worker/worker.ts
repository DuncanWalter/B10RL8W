import { trainNewAgent } from './trainAgent'
import { Command, postMessage } from './protocol'

let cancel = () => {}

self.onmessage = event => {
  const data: Command = JSON.parse(event.data)
  switch (data.command) {
    case 'train-agent': {
      cancel = trainNewAgent(data)
      break
    }
    case 'evaluate-agents': {
      // postMessage({
      //   type: 'evaluation-results',
      //   results: [
      //     {
      //       meanScore: 0,
      //       stdDevScore: 0,
      //       meanPerformance: 0,
      //       stdDevPerformance: 0,
      //     },
      //   ],
      // })
      postMessage({ type: 'done' })
      break
    }
    case 'cancel-work': {
      cancel()
      break
    }
    default: {
      throw new Error('Unrecognized command given to web-worker instance')
    }
  }
}
