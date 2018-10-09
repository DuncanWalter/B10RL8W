const script = (document.getElementById('worker') as any).src

type TrainCommand = {
  agentName: string
  epochs: number
  simplified: boolean
  onProgress(
    snapshots: {
      epoch: number
      random: Snapshot
      agent: Snapshot
      heuristic: Snapshot
    }[],
  ): void
  agentType: 'contextless' | 'card-counting' | 'rule-tracking' | 'complete'
}

type Snapshot = {
  scoreMean: number
  scoreStdDev: number
  performanceMean: number
  performanceStdDev: number
}

type TrainingProgressMessage = {
  type: 'training-progress'
  snapshots: {
    epoch: number
    random: Snapshot
    agent: Snapshot
    heuristic: Snapshot
  }[]
}

type DoneMessage = {
  type: 'done'
}

export function trainAgent({
  agentName,
  agentType,
  epochs,
  onProgress,
  simplified,
}: TrainCommand): Promise<void> & { cancel: () => void } {
  const worker = new Worker(script)
  const training = new Promise(resolve => {
    worker.onerror = () => {
      throw new Error('Worker process encountered unexpected error')
    }
    worker.onmessage = ({ data }) => {
      const message: TrainingProgressMessage | DoneMessage = JSON.parse(data)
      switch (message.type) {
        case 'training-progress': {
          onProgress(message.snapshots)
          return
        }
        case 'done': {
          worker.terminate()
          resolve()
          return
        }
        default: {
          throw new Error('Received unexpected message from a web-worker')
        }
      }
    }
    worker.postMessage(
      JSON.stringify({
        command: 'train-agent',
        agentType,
        agentName,
        simplified,
        epochs,
      }),
    )
  }) as Promise<void> & { cancel: () => void }
  training.cancel = () =>
    worker.postMessage(JSON.stringify({ command: 'cancel-work' }))
  return training
}

export function evaluateAgents({
  names,
  simplified,
}: {
  names: string[]
  simplified: boolean
}): Promise<{ [name: string]: Snapshot }> {
  return new Promise(resolve => {
    const worker = new Worker(script)
    worker.onerror = () => {
      throw new Error('Worker process encountered unexpected error')
    }
    worker.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      switch (message.type) {
        case 'evaluation-results': {
          worker.terminate()
          resolve(message.results)
          return
        }
        default: {
          throw new Error('Received unexpected message from a web-worker')
        }
      }
    }
    worker.postMessage(
      JSON.stringify({
        command: 'evaluate-agents',
        names,
        simplified,
      }),
    )
  })
}
