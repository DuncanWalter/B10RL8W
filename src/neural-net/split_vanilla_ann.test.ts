import * as Math from 'mathjs'
import { Split_Vanilla_ANN } from './split_vanilla_ann'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = Math.matrix([[0, 0], [0, 1], [1, 0], [1, 1]])
  let yData = Math.matrix([[0], [1], [1], [0]])

  let ann = new Split_Vanilla_ANN(xData, yData, 20000, 0.1, [2, 3, 1])

  let activation0, output
  ;[output, activation0] = ann.forwardprop()
  let err = ann.error(output as number[]) as Math.Matrix

  let errSum = 0
  for (let i = 0; i < err.size()[0]; i++) {
    errSum += err.get([i, 0])
  }
  console.log(errSum.toFixed(15))

  ann.backprop(err as Math.Matrix, activation0 as Math.Matrix)
})
