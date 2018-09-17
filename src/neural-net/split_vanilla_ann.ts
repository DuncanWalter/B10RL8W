import * as Math from 'mathjs'
import { sigmoid, sigmoidDeriv } from './ann_helper'

type LayerDeclaration = [
  { nodes: number },
  ...{ nodes: number; activation: (n: number) => number }[]
]
type Transformation = { activation: (n: number) => number; weights: number[][] }

export class Split_Vanilla_ANN {
  xData: Math.Matrix
  yData: Math.Matrix
  lr: number
  transforms: Transformation[]

  constructor(
    xData: Math.Matrix,
    yData: Math.Matrix,
    lr: number,
    layers: LayerDeclaration,
  ) {
    this.xData = xData
    this.yData = yData
    this.lr = lr
    this.transforms = this.initTransforms(layers)
  }

  initTransforms(layers: LayerDeclaration, seed: () => number = Math.random) {
    // random initial weights

    const [, ...activationLayers] = layers
    const bandwidth = layers.map(({ nodes }) => nodes)

    const transforms: Transformation[] = new Array(activationLayers.length)

    for (let i = 0; i < activationLayers.length; i++) {
      const weights: number[][] = (Math.zeros(
        bandwidth[i],
        bandwidth[i + 1],
      ) as any) as number[][]
      weights[i] = weights[i].map(x => Math.random())
      transforms[i] = { weights, activation: activationLayers[i].activation }
    }

    return transforms
  }

  feed(input: number[]): { output: number[]; feedTrace: number[][] } {
    const feedTrace: number[][] = [input]
    const output = this.transforms.reduce(
      (output: number[], { weights, activation }: Transformation) => {
        const activationLayer = (Math.multiply(
          output,
          weights,
        ) as number[]).map(activation)
        feedTrace.push(activationLayer)
        return activationLayer
      },
      input,
    )

    // TODO: will need to add bias terms in future

    return {
      output,
      feedTrace,
    }
  }

  backprop({ feedTrace, error }: { feedTrace: number[][]; error: number[] }) {
    // back propagation
    const delta = Math.multiply(error, this.lr)
    this.transforms.reduceRight((delta, { weights, prime }, i) => {
      // TODO: transpose won't work for that operation
      Math.add(weights, Math.multiply(Math.transpose(feedTrace[i]), delta))

      return Math.dotMultiply(
        Math.multiply(delta, Math.transpose(weights)),
        delta.map(prime),
      )
    }, delta)

    // this.weights[1] = Math.add(
    //   this.weights[1],
    //   Math.multiply(Math.transpose(activation0), dz),
    // ) as Math.Matrix

    this.weights[0] = Math.add(
      this.weights[0],
      Math.multiply(Math.transpose(this.xData), dh),
    ) as Math.Matrix
  }

  error(output: number[]) {
    // TODO: will need to make more complex error calculation
    return Math.subtract(this.yData, output)
  }
}
