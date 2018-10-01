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
} from './gameSummary'

export const contextlessSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
)

// TODO lift this into a function that can create agents of any leaning kind
// TODO we need by handing it a gameSummary object.
export function createContextlessAgent(): Agent<unknown> {
  function huberLoss(a: number, b: number) {
    if (Math.abs(a - b) > 6) {
      return 0.5 * (6 * (Math.abs(a - b) - 6) + 36)
    } else {
      return 0.5 * (a - b) ** 2
    }
  }
  function huberLossGradient(expected: number, actual: number) {
    return Math.max(-6, Math.min(actual - expected, 6))
  }
  const net = new NeuralNet(
    {
      learningRate: 0.00003,
      inputSize: contextlessSummary.size,
    },
    guardTransform(),
    denseTransform(96),
    logicalTransform(64),
    logicalTransform(64),
    logicalTransform(64),
    denseTransform(1),
  )

  return {
    policy(state: State, player: Player, actions: Card[]) {
      return actions
        .map(action => [...contextlessSummary.summary(state, player, action)])
        .map(data => net.passForward(data))
        .map(({ trace, output: [quality] }, index) => ({
          quality,
          trace: trace,
          action: actions[index],
        }))
    },
    train(feedBack: FeedBack<unknown>[]) {
      net.passBack(
        feedBack.map(({ expected, actual, trace }) => ({
          error: [huberLossGradient(expected, actual)],
          trace: trace,
        })),
      )
      const loss = feedBack.map(({ actual, expected }) => {
        return huberLoss(actual, expected)
      })
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
