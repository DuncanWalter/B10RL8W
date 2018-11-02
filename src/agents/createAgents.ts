import { Agent, FeedBack } from '.'
import { Player, State, Card } from '../simulator'
import {
  guardTransform,
  denseTransform,
  logicalTransform,
} from '../neural-net/transform'
import NeuralNet from '../neural-net'
import {
  joinSummaries,
  handSummary,
  trickSummary,
  actionSummary,
  ruleSummary,
  cardSummary,
  GameSummary,
  opponentSummary,
} from './gameSummary'
import { LearningMethod } from './learningMethods'

export const contextlessSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
)

export const ruleTrackingSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
  ruleSummary,
)

export const cardCountingSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
  cardSummary,
)

export const cardSharkSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
  opponentSummary,
)

export const cardGuruSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
  ruleSummary,
  cardCountingSummary,
)

export function createAgent(
  agentSummary: GameSummary<number>,
  learningMethod: LearningMethod,
  serializedContent?: string,
): Agent<unknown> {
  // huber loss is like squared error loss but more robust to outliers
  const huberConst = 2
  function huberLoss(a: number, b: number) {
    if (Math.abs(a - b) > huberConst) {
      return huberConst * (Math.abs(a - b) - huberConst) + 0.5 * huberConst ** 2
    } else {
      return 0.5 * (a - b) ** 2
    }
  }
  function huberLossGradient(expected: number, actual: number) {
    return Math.max(-1 * huberConst, Math.min(actual - expected, huberConst))
  }
  const huberifiedLearningMethod = learningMethod(huberLoss, huberLossGradient)
  const net = new NeuralNet(
    {
      learningRate: 0.001, //0.01,
      learningDecay: 0.5 ** (1 / 10000),
      inputSize: agentSummary.size,
      serializedContent,
    },
    guardTransform(),
    denseTransform(64),
    logicalTransform(48), // logical transforms essentially constitute a hidden layer
    logicalTransform(32),
    logicalTransform(16),
    denseTransform(1),
  )

  return {
    policy(state: State, player: Player, actions: Card[]) {
      return actions
        .map(action => [...agentSummary.summary(state, player, action)])
        .map(data => net.passForward(data))
        .map(({ trace, output: [quality] }, index) => ({
          quality,
          trace: trace,
          action: actions[index],
        }))
    },
    train(feedBack: FeedBack<unknown>[]) {
      const learningUpdates = huberifiedLearningMethod(feedBack)
      net.passBack(learningUpdates)
      const loss = learningUpdates.map(({ loss }) => loss)
      const mean = loss.reduce((sum, loss) => sum + loss) / loss.length
      const variance =
        loss.reduce((sum, loss) => sum + (loss - mean) ** 2) / loss.length
      return {
        meanLoss: mean,
        stdDevLoss: Math.sqrt(variance),
      }
    },
    serialize() {
      return net.serialize()
    },
  }
}
