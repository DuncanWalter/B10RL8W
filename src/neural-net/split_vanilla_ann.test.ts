import { Split_Vanilla_ANN } from './split_vanilla_ann'
import {
  sigmoid,
  sigmoidDeriv,
  reluActivation,
  signActivation,
} from './ann_helper'
import { range } from '../utils/range'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = [[0, 0], [0, 1], [1, 0], [1, 1]]
  let yData = [[0], [1], [1], [-1]]

  let ann = new Split_Vanilla_ANN(0.12, [
    { nodes: 2 },
    { nodes: 7, activation: signActivation },
    { nodes: 3, activation: signActivation },
    { nodes: 1, activation: { feed: i => i, prime: i => 1 } },
  ])
  for (let epoch of range(3000)) {
    let feedBack = []
    for (let i in xData) {
      const { output, feedTrace } = ann.feed(xData[i])
      const error = [yData[i][0] - output[0]]
      if (epoch % 300 === 0) {
        console.log(error[0])
      }
      feedBack.push({ feedTrace, error: error })
    }
    ann.backProp(feedBack)
    feedBack = []
  }
  // console.log(ann.getWeights())
})
