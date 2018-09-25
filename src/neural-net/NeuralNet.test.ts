import NeuralNet from './NeuralNet'
import {
  denseTransform,
  biasTransform,
  batchNormTransform,
  leakyReluTransform,
} from './transform'
import { guardTransform } from './transform/guard'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = [[0, 0], [0, 37], [1, 0], [1, 36]]
  let yData = [[0], [1], [1], [0]]

  let ann = new NeuralNet(
    {
      learningRate: 0.05,
      inputSize: 2,
    },
    guardTransform(),
    denseTransform(11),
    biasTransform(),
    // batchNormTransform(),
    leakyReluTransform(),
    denseTransform(5),
    biasTransform(),
    // batchNormTransform(),
    leakyReluTransform(),
    // splitTransform(
    //   { transform: leakyReluTransform(), inCount: 2, outCount: 2 },
    //   { transform: sigmoidTransform(), inCount: 3, outCount: 3 },
    // ),
    denseTransform(1),
  )

  for (let epoch = 0; epoch < 3000; epoch++) {
    let feedBack = []
    let err = 0
    for (let i in xData) {
      const { output, trace } = ann.passForward(xData[i])
      const error = [yData[i][0] - output[0]]
      err += Math.abs(error[0])
      feedBack.push({ trace, error: error })
    }
    if (epoch % 1000 === 999) {
      console.log(err)
    }
    ann.passBack(feedBack)
    feedBack = []
  }
})
