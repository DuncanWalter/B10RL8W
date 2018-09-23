import { Agent, interpretHistory, FeedBack } from '.'
import {
  ANNSummary,
  createContextlessAgent,
  contextlessSummary,
} from './contextless'
import { playGame } from '../simulator'
import { trainAgent } from './training'
import NeuralNet from '../neural-net/NeuralNet'
import { guardTransform, denseTransform } from '../neural-net/transform'
import { logicalTransform } from '../neural-net/transform/logical'

test('Running random agents works', () => {
  let ann = new NeuralNet(
    {
      learningRate: 0.01,
      inputSize: contextlessSummary.size,
    },
    guardTransform(),
    denseTransform(128),
    logicalTransform(96),
    // logicalTransform(64),
    denseTransform(1),
  )

  let agent = createContextlessAgent(ann)
  trainAgent(
    agent,
    100,
    false,
    (gamesPlayed, summary) => {
      console.log(gamesPlayed)
      console.log(summary)
    },
    3000,
  )
})
