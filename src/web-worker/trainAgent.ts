import {
  trainAgent,
  createContextlessAgent,
  Agent,
  createRandomAgent,
} from '../agents'
import { config } from '../config'
import { evaluateAgents } from '../agents/evaluating'
import { createHeuristicAgent } from '../agents/heuristic'

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
  let heuristicAgent = createHeuristicAgent(simplified)

  trainAgent(trainingAgent, epochs, simplified, epoch => {
    additionalEpochsTrained += 1

    if (epoch === 0 || epoch % 5 === 4 || epoch === epochs - 1) {
      const [agent, random, heuristic] = evaluateAgents(
        [trainingAgent, randomAgent, heuristicAgent],
        150,
        simplified,
      )
      emitProgress({
        epoch: epoch + 1,
        agent,
        random,
        heuristic,
      })
    }

    if (epoch === 0 || epoch === epochs - 1) {
      fetch(
        new Request(
          `http://localhost:${config.loggerPort}/log/${encodeURIComponent(
            name,
          )}`,
          {
            method: 'POST',
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
