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
  opponentSummary,
)

export function createAgent(
  agentSummary: GameSummary<number>,
  learningMethod: LearningMethod,
): Agent<unknown> {
  // huber loss is like squared error loss but more robust to outliers
  function huberLoss(a: number, b: number) {
    if (Math.abs(a - b) > 2) {
      return 0.5 * (2 * (Math.abs(a - b) - 2) + 36)
    } else {
      return 0.5 * (a - b) ** 2
    }
  }
  function huberLossGradient(expected: number, actual: number) {
    return Math.max(-2, Math.min(actual - expected, 2))
  }
  const huberifiedLearningMethod = learningMethod(huberLoss, huberLossGradient)
  const net = new NeuralNet(
    {
      learningRate: 0.03,
      learningDecay: 0.5 ** (1 / 2500),
      inputSize: agentSummary.size,
    },
    guardTransform(),
    denseTransform(80),
    logicalTransform(65),
    logicalTransform(50),
    logicalTransform(30),
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
