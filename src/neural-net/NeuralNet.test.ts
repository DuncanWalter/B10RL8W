import NeuralNet from './NeuralNet'
import {
  denseTransform,
  biasTransform,
  batchNormTransform,
  leakyReluTransform,
  sigmoidTransform,
} from './transform'

test('The xor function works', () => {
  // xor function
  // TODO: need test data for our problem
  let xData = [[0, 0], [0, 1], [1, 0], [1, 1]]
  let yData = [[0], [1], [1], [0]]

  let ann = new NeuralNet(
    {
      learningRate: 0.08,
      inputSize: 2,
    },
    denseTransform(11),
    biasTransform(),
    batchNormTransform(),
    leakyReluTransform(),
    denseTransform(5),
    biasTransform(),
    batchNormTransform(),
    leakyReluTransform(),
    // splitTransform(
    //   { transform: leakyReluTransform(), inCount: 2, outCount: 2 },
    //   { transform: sigmoidTransform(), inCount: 3, outCount: 3 },
    // ),
    denseTransform(1),
  )
  for (let epoch = 0; epoch < 3000; epoch++) {
    let feedBack = []
    for (let i in xData) {
      const { output, trace } = ann.passForward(xData[i])
      const error = [yData[i][0] - output[0]]
      if (epoch % 300 === 0) {
        console.log(error[0])
      }
      if (epoch % 1500 === 5) {
        console.log(ann.serialize())
      }
      feedBack.push({ trace, error: error })
    }
    ann.passBack(feedBack)
    feedBack = []
    // if (epoch > 0) {
    // break
    // }
  }
})
