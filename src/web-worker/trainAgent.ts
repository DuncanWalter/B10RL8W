import {
  trainAgent,
  createAgent,
  Agent,
  createRandomAgent,
  contextlessSummary,
  ruleTrackingSummary,
  cardCountingSummary,
  cardSharkSummary,
  cardGuruSummary,
  DQNLearning,
  QLearning,
} from '../agents'
import { config } from '../config'
import { evaluateAgents } from '../agents/evaluating'
import { createHeuristicAgent } from '../agents/heuristic'
import { TrainCommand, postMessage } from './protocol'

const evalBatchSize = 250
const epochStepSize = 100

export function trainNewAgent({
  agentType,
  agentName,
  epochs,
  simplified,
}: TrainCommand) {
  let trainingAgent: Agent
  switch (agentType) {
    case 'contextless': {
      trainingAgent = createAgent(contextlessSummary, QLearning)
      break
    }
    case 'rule-tracking': {
      trainingAgent = createAgent(ruleTrackingSummary, DQNLearning)
      break
    }
    case 'card-counting': {
      trainingAgent = createAgent(cardCountingSummary, DQNLearning)
      break
    }
    case 'card-shark': {
      trainingAgent = createAgent(cardSharkSummary, DQNLearning)
      break
    }
    case 'guru': {
      trainingAgent = createAgent(cardGuruSummary, QLearning)
      break
    }
    default: {
      throw new Error('Unrecognized agent type')
    }
  }

  let additionalEpochsTrained = 0
  let loss = NaN

  const randy = createRandomAgent()
  const hugo = createHeuristicAgent()

  const [agent, random, heuristic] = evaluateAgents(
    [trainingAgent, randy, hugo],
    evalBatchSize,
    simplified,
  )

  postMessage({
    type: 'training-progress',
    epoch: 0,
    agent,
    random,
    heuristic,
    agentLoss: NaN,
  })

  return trainAgent(
    trainingAgent,
    epochs,
    simplified,
    (epoch, error) => {
      additionalEpochsTrained += 1
      loss =
        loss !== loss
          ? error
          : (1 - 1 / epochStepSize) * loss + error / epochStepSize

      if (epoch % epochStepSize === 0 || epoch === epochs) {
        const [agent, random, heuristic] = evaluateAgents(
          [trainingAgent, randy, hugo],
          evalBatchSize,
          simplified,
        )
        postMessage({
          type: 'training-progress',
          epoch,
          agent,
          random,
          heuristic,
          agentLoss: loss,
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
