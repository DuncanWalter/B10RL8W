import {
  trainAgent,
  createContextlessAgent,
  Agent,
  createRandomAgent,
} from '../agents'
import { config } from '../config'
import { evaluateAgents } from '../agents/evaluating'

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

  let randomAgent = createRandomAgent()
  // TODO:
  let heuristicAgent = createRandomAgent()

  trainAgent(trainingAgent, epochs, simplified, epoch => {
    // TODO keep track of agent epochs for logging,
    // TODO occasionally log, and run evaluations

    const [agent, random, heuristic] = evaluateAgents(
      [trainingAgent, randomAgent, heuristicAgent],
      100,
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
        new Request(
          `http://localhost:${config.port}/log/${encodeURIComponent(name)}`,
          {
            method: 'POST',
            // mode: 'no-cors',
            headers: {
              'content-type': 'text/json',
            },
            body: JSON.stringify({
              serializedContent: trainingAgent.serialize(),
              additionalEpochsTrained,
            }),
          },
        ),
      )
    }
  })
}
