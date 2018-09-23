import * as Math from 'mathjs'
import { sigmoid, sigmoidDeriv } from './ann_helper'

export class Vanilla_ANN {
  nodes: number[]
  epochs: number
  xData: Math.Matrix
  yData: Math.Matrix
  lr: number
  weights: Math.Matrix[]

  constructor(
    xData: Math.Matrix,
    yData: Math.Matrix,
    epochs: number,
    lr: number,
    nodes: number[],
  ) {
    this.xData = xData
    this.yData = yData
    this.epochs = epochs
    this.lr = lr
    this.nodes = nodes // # of nodes per layer
    this.weights = this.initWeights()
  }

  initWeights() {
    // random initial weights
    this.weights = Array(this.nodes.length - 1)

    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = Math.zeros(
        this.nodes[i],
        this.nodes[i + 1],
      ) as Math.Matrix
      this.weights[i] = this.weights[i].map(x => Math.random())
    }

    return this.weights
  }

  backprop() {
    for (let i = 0; i < this.epochs; i++) {
      // NOTE: will need to add bias terms in future

      // forward propagtion
      let hidden0 = Math.multiply(this.xData, this.weights[0]) as Math.Matrix
      let activation0 = hidden0.map(sigmoid) as Math.Matrix
      let output = Math.multiply(activation0, this.weights[1])

      let err = this.error(output as number[]) as Math.Matrix

      if (this.epochs % 5000 == 0) {
        //console.log(err)
        let errSum = 0
        for (let i = 0; i < err.size()[0]; i++) {
          errSum += err.get([i, 0])
        }
      }

      // back propagation
      let dz = Math.multiply(err, this.lr)

      this.weights[1] = Math.add(
        this.weights[1],
        Math.multiply(Math.transpose(activation0), dz),
      ) as Math.Matrix

      let dh = Math.dotMultiply(
        Math.multiply(dz, Math.transpose(this.weights[1])),
        activation0.map(sigmoidDeriv),
      )

      this.weights[0] = Math.add(
        this.weights[0],
        Math.multiply(Math.transpose(this.xData), dh),
      ) as Math.Matrix
    }
  }

  error(output: number[]) {
    // NOTE: will need to make more complex error calculation
    return Math.subtract(this.yData, output)
  }
}
