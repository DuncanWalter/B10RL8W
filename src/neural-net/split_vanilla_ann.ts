// import * as Math from 'mathjs'
import {
  matrix,
  colMulRow,
  rowMulMat,
  mapRow,
  matAddMat,
  matMulCol,
  rowZip,
} from './ann_helper'

export type LayerDeclaration = [
  { nodes: number },
  ...{ nodes: number; activation: Activation }[]
]

export type Activation = {
  feed: (n: number) => number
  prime: (n: number) => number
}

export type Transformation = { activation: Activation; weights: number[][] }

export function composeActivations(a: Activation, b: Activation): Activation {
  const { feed: aFeed, prime: aPrime } = a
  const { feed: bFeed, prime: bPrime } = b
  return {
    feed(n: number) {
      return aFeed(bFeed(n))
    },
    prime(n: number) {
      return bPrime(aPrime(n))
    },
  }
}

export class Split_Vanilla_ANN {
  lr: number
  transforms: Transformation[]

  constructor(lr: number, layers: LayerDeclaration) {
    this.lr = lr
    this.transforms = this.initTransforms(layers, () => Math.random() * 2 - 1)
  }

  initTransforms(layers: LayerDeclaration, seed: () => number = Math.random) {
    const [, ...activationLayers] = layers
    const bandwidth = layers.map(({ nodes }) => nodes)

    const transforms: Transformation[] = new Array(activationLayers.length)

    for (let i = 0; i < activationLayers.length; i++) {
      const weights: number[][] = matrix(bandwidth[i + 1], bandwidth[i], seed)
      transforms[i] = { weights, activation: activationLayers[i].activation }
    }

    return transforms
  }

  feed(input: number[]): { output: number[]; feedTrace: number[][] } {
    const feedTrace: number[][] = [input]
    const output = this.transforms.reduce(
      (output: number[], { weights, activation: { feed } }: Transformation) => {
        const activationLayer = rowMulMat(output, weights)
        mapRow(activationLayer, feed, activationLayer)
        feedTrace.push(activationLayer)
        return activationLayer
      },
      input,
    )
    // NOTE: could add bias here
    return {
      output,
      feedTrace,
    }
  }

  backProp(feedBack: { feedTrace: number[][]; error: number[] }[]) {
    // TODO: create deltas matrix and any reusable buffers

    const updates = this.transforms.map(({ weights }) => {
      return matrix(weights.length, weights[0].length, () => 0)
    })

    for (let { feedTrace, error } of feedBack) {
      const delta = mapRow(error, n => (n * this.lr) / feedBack.length)
      this.transforms.reduceRight(
        (
          delta: number[],
          { weights, activation: { prime } }: Transformation,
          i: number,
        ) => {
          // NOTE: add to a blank matrix for storing deltas
          // NOTE: when batching
          const changes = colMulRow(feedTrace[i], delta)
          matAddMat(updates[i], changes)
          const nextDelta = rowZip(
            matMulCol(weights, delta),
            mapRow(feedTrace[i], prime),
            (a, b) => a * b,
            // TODO: clean up memory alocs in the batched backprop
          )
          return nextDelta
        },
        delta,
      )
    }

    this.transforms.forEach(({ weights }, i) => {
      matAddMat(weights, updates[i])
    })
  }
  getWeights(): number[][][] {
    return this.transforms.map(({ weights }) => weights)
  }
}
