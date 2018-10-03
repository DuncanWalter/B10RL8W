import {
  trainAgent,
  createContextlessAgent,
  Agent,
  createRandomAgent,
} from '../agents'
import { config } from '../config'

type TrainingConfiguration = {
  name: string
  agentType: string
  simplified: boolean
  epochs: number
  emitProgress: (
    snapshot: {
      epoch: number
      agent: unknown
      random: unknown
      heuristic: unknown
    },
  ) => void
}

export function trainNewAgent({
  name,
  agentType,
  simplified,
  epochs,
  emitProgress,
}: TrainingConfiguration) {
  let trainingAgent: Agent
  switch (agentType) {
    case 'contextless': {
      trainingAgent = createContextlessAgent()
      break
    }
    default: {
      throw new Error('Unrecognized agent type')
    }
  }

  let additionalEpochsTrained = 0

  let randomAgent = createRandomAgent(36)
  // TODO:
  let heuristicAgent = createRandomAgent(36)

  trainAgent(trainingAgent, epochs, simplified, epoch => {
    // TODO keep track of agent epochs for logging,
    // TODO occasionally log, and run evaluations

    const [agent, random, heuristic] = evaluateAgents(
      [trainingAgent, randomAgent, heuristicAgent],
      simplified,
    )
    emitProgress({
      epoch,
      agent,
      random,
      heuristic,
    })

    additionalEpochsTrained += 1
    if (epoch === epochs - 1) {
      fetch(
        new Request(`localhost:${config.port}/${encodeURIComponent(name)}`, {
          method: 'POST',
          body: JSON.stringify({
            serializedContent: trainingAgent.serialize(),
            additionalEpochsTrained,
          }),
        }),
      )
    }
  })
}
