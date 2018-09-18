import { Split_Vanilla_ANN } from './split_vanilla_ann'
import { sigmoid, sigmoidDeriv } from './ann_helper'
import { range } from '../utils/range'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = [[0, 0], [0, 1], [1, 0], [1, 1]]
  let yData = [[0], [1], [1], [0]]

  let ann = new Split_Vanilla_ANN(0.01, [
    { nodes: 2 },
    { nodes: 9, activation: { feed: sigmoid, prime: sigmoidDeriv } },
    { nodes: 6, activation: { feed: sigmoid, prime: sigmoidDeriv } },
    { nodes: 3, activation: { feed: sigmoid, prime: sigmoidDeriv } },
    { nodes: 1, activation: { feed: i => i, prime: i => 1 } },
  ])
  for (let epoch of range(100)) {
    for (let i in xData) {
      const { output, feedTrace } = ann.feed(xData[i])
      const error = [yData[i][0] - output[0]]
      ann.backProp({ feedTrace, error: error })
    }
  }
})
