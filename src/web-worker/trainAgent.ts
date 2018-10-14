import {
  trainAgent, createAgent, Agent, createRandomAgent,
  ruleTrackingSummary, cardCountingSummary, cardSharkSummary
} from '../agents'
import { config } from '../config'
import { evaluateAgents } from '../agents/evaluating'
import { createHeuristicAgent } from '../agents/heuristic'
import { TrainCommand, postMessage } from './protocol'
import { contextlessSummary, cardGuruSummary } from '../agents/createAgents'

export function trainNewAgent({
  agentType,
  agentName,
  epochs,
  simplified,
}: TrainCommand) {
  let trainingAgent: Agent
  switch (agentType) {
    case 'contextless': {
      trainingAgent = createAgent(contextlessSummary)
      break
    }
    case 'rule-tracking': {
      trainingAgent = createAgent(ruleTrackingSummary)
      break
    }
    case 'card-counting': {
      trainingAgent = createAgent(cardCountingSummary)
      break
    }
    case 'card-shark': {
      trainingAgent = createAgent(cardSharkSummary)
      break
    }
    case 'guru': {
      trainingAgent = createAgent(cardGuruSummary)
      break
    }
    default: {
      throw new Error('Unrecognized agent type')
    }
  }

  let additionalEpochsTrained = 0

  const randy = createRandomAgent()
  const hugo = createHeuristicAgent()

  return trainAgent(
    trainingAgent,
    epochs,
    simplified,
    epoch => {
      additionalEpochsTrained += 1

      if (epoch === 1 || epoch % 100 === 0 || epoch === epochs) {
        const [agent, random, heuristic] = evaluateAgents(
          [trainingAgent, randy, hugo],
          150,
          simplified,
        )
        postMessage({
          type: 'training-progress',
          epoch,
          agent,
          random,
          heuristic,
        })
      }

      if (epoch === 1 || epoch === epochs) {
        fetch(
          new Request(
            `http://localhost:${config.loggerPort}/log/${encodeURIComponent(
              agentName,
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
    },
    () => postMessage({ type: 'done' }),
  )
}
