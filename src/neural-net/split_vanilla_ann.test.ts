import {
  Split_Vanilla_ANN,
  denseTransform,
  leakyReluTransform,
  biasTransform,
} from './split_vanilla_ann'
import { batchTransform, splitTransform, sigmoidTransform } from './ann_helper'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = [[0, 0], [0, 1], [1, 0], [1, 1]]
  let yData = [[0], [1], [1], [0]]

  let ann = new Split_Vanilla_ANN(0.08, [
    denseTransform(2, 11),
    biasTransform(11),
    batchTransform(),
    leakyReluTransform(),
    denseTransform(11, 5),
    biasTransform(5),
    batchTransform(),
    splitTransform(
      { transform: leakyReluTransform(), inCount: 2, outCount: 2 },
      { transform: sigmoidTransform(), inCount: 3, outCount: 3 },
    ),
    denseTransform(5, 1),
  ])
  for (let epoch = 0; epoch < 3000; epoch++) {
    let feedBack = []
    for (let i in xData) {
      const { output, feedTrace } = ann.feed(xData[i])
      const error = [yData[i][0] - output[0]]
      feedBack.push({ feedTrace, error: error })
    }
    ann.backProp(feedBack)
    feedBack = []
  }
})
