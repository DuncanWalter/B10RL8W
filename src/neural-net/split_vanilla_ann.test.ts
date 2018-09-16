import * as Math from 'mathjs'
import { Split_Vanilla_ANN } from './split_vanilla_ann'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = Math.matrix([[0, 0], [0, 1], [1, 0], [1, 1]])
  let yData = Math.matrix([[0], [1], [1], [0]])

  let ann = new Split_Vanilla_ANN(xData, yData, 50000, 0.1, [2, 3, 1])

  let err
  let activation0
  ;[err, activation0] = ann.forwardprop()
  console.log('here')
  ann.backprop(err as number[], activation0 as Math.Matrix)
})
