declare function postMessage(message: string): void

self.onmessage = event => {
  const data = JSON.parse(event.data)
  switch (data.command) {
    case 'train-agent': {
      postMessage(JSON.stringify({ type: 'done', hash: data.hash }))
      break
    }
    case 'evaluate-agents': {
      postMessage(
        JSON.stringify({
          type: 'evaluation-results',
          results: {
            meanScore: 0,
            stdDevScore: 0,
            meanPerformance: 0,
            stdDevPerformance: 0,
          },
        }),
      )
      break
    }
    default: {
      throw new Error('Unrecognized command given to web-worker instance')
    }
  }
}
