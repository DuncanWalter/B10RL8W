import * as Math from 'mathjs'
import { Vanilla_ANN } from './vanilla_ann'

test('The xor function works', () => {
  // xor function
  let xData = Math.matrix([[0, 0], [0, 1], [1, 0], [1, 1]])
  let yData = Math.matrix([[0], [1], [1], [0]])

  let ann = new Vanilla_ANN(xData, yData, 100, 0.1, [2, 3, 1])
  ann.backprop()
})
