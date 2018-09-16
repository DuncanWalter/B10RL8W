import * as Math from 'mathjs'
import { sigmoid, sigmoidDeriv } from './ann_helper'

export class Split_Vanilla_ANN {
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
      console.log(this.weights[i])
    }

    return this.weights
  }

  forwardprop() {
    let hidden0, output, err
    let activation0: Math.Matrix = Math.matrix()

    // TODO: will need to add bias terms in future

    // forward propagtion
    hidden0 = Math.multiply(this.xData, this.weights[0]) as Math.Matrix

    //QUESTION: how to append row to matrix?
    activation0 = hidden0.map(sigmoid) as Math.Matrix
    output = Math.multiply(activation0, this.weights[1])

    //err = this.error(output as number[])

    return [output, activation0]
  }

  backprop(err: number[], activation0: Math.Matrix) {
    // back propagation
    for (let i = 0; i < this.epochs; i++) {
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
    // TODO: will need to make more complex error calculation
    return Math.subtract(this.yData, output)
  }
}
