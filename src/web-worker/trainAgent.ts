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
  SARSALearning,
} from '../agents'
import { config } from '../config'
import { evaluateAgents } from '../agents/evaluating'
import { createHeuristicAgent } from '../agents/heuristic'
import { TrainCommand, postMessage } from './protocol'
import { LogUpdate } from '../logger/types'

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
      trainingAgent = createAgent(ruleTrackingSummary, QLearning)
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

  let additionalSnapshots: LogUpdate['snapshots'] = []
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
        additionalSnapshots.push({
          ...agent,
          epoch,
        })
      }

      if (epoch === 1 || epoch === epochs) {
        const update: LogUpdate = {
          serializedContent: trainingAgent.serialize(),
          additionalEpochsTrained,
          snapshots: additionalSnapshots,
          agentType,
          simplified,
        }
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
              body: JSON.stringify(update),
            },
          ),
        )
      }
    },
    () => postMessage({ type: 'done' }),
  )
}
