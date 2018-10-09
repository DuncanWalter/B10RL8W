import {
  DoneMessage,
  TrainingProgressMessage,
  TrainCommand,
  AgentEvaluation,
  EvaluateCommand,
} from './protocol'

const script = (document.getElementById('worker') as any).src

export function trainAgent({
  agentName = 'Fred',
  agentType = 'contextless',
  epochs = 10,
  onProgress = (_: TrainingProgressMessage) => {},
  simplified = true,
}): Promise<void> & { cancel: () => void } {
  const worker = new Worker(script)
  const training = new Promise(resolve => {
    worker.onerror = () => {
      throw new Error('Worker process encountered unexpected error')
    }
    worker.onmessage = ({ data }) => {
      const message: TrainingProgressMessage | DoneMessage = JSON.parse(data)
      switch (message.type) {
        case 'training-progress': {
          onProgress(message)
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
      } as TrainCommand),
    )
  }) as Promise<void> & { cancel: () => void }
  training.cancel = () =>
    worker.postMessage(JSON.stringify({ command: 'cancel-work' }))
  return training
}

export function evaluateAgents({
  agents,
  simplified,
}: {
  agents: string[]
  simplified: boolean
}): Promise<{ [name: string]: AgentEvaluation }> {
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
        agents,
        simplified,
      } as EvaluateCommand),
    )
  })
}
