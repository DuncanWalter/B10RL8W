import {
  Split_Vanilla_ANN,
  denseTransform,
  reluTransform,
} from './split_vanilla_ann'
import { batchTransform } from './ann_helper'
import { range } from '../utils/range'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = [[0, 0], [0, 1], [1, 0], [1, 1]]
  let yData = [[0], [1], [1], [-1]]

  let ann = new Split_Vanilla_ANN(0.05, [
    denseTransform(2, 7),
    batchTransform(),
    reluTransform(),
    denseTransform(7, 3),
    batchTransform(),
    reluTransform(),
    denseTransform(3, 1),
  ])
  for (let epoch of range(3000)) {
    let feedBack = []
    for (let i in xData) {
      const { output, feedTrace } = ann.feed(xData[i])
      const error = [yData[i][0] - output[0]]
      if (epoch % 300 === 0) {
        console.log(error)
      }
      feedBack.push({ feedTrace, error: error })
    }
    ann.backProp(feedBack)
    feedBack = []
    // break
  }
  // console.log(ann.getWeights())
})
