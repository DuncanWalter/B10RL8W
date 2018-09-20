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

export type Activation<
  FeedMeta = undefined,
  PrimeMeta = undefined
> = (FeedMeta extends undefined
  ? {
      feed: (n: number, meta: FeedMeta, i: number) => number
      metaFeed?: undefined
    }
  : {
      metaFeed: (batch: number[]) => FeedMeta
      feed: (n: number, meta: FeedMeta, i: number) => number
    }) &
  (PrimeMeta extends undefined
    ? {
        prime: (dn: number, n: number, meta: PrimeMeta, i: number) => number
        metaPrime?: undefined
      }
    : {
        metaPrime: (dBatch: number[], batch: number[]) => PrimeMeta
        prime: (dn: number, n: number, meta: PrimeMeta, i: number) => number
      })

export type Transformation<F = any, P = any> = {
  activation: Activation<F, P>
  weights: number[][]
}

export function composeActivations<AF, AP, BF, BP>(
  a: Activation<AF, AP>,
  b: Activation<BF, BP>,
): Activation<{ left: AF; right: BF }, { left: AP; right: BP }> {
  return {
    metaFeed(batch: number[]) {
      return {
        right:
          b.metaFeed === undefined
            ? ((undefined as any) as BF)
            : b.metaFeed(batch),
        left:
          a.metaFeed === undefined
            ? ((undefined as any) as AF)
            : a.metaFeed(batch),
      }
    },
    feed(n: number, meta, i) {
      return a.feed(b.feed(n, meta.right, i), meta.left, i)
    },
    metaPrime(dBatch: number[], batch: number[]) {
      return {
        right:
          b.metaPrime === undefined
            ? ((undefined as any) as BP)
            : b.metaPrime(dBatch, batch),
        left:
          a.metaPrime === undefined
            ? ((undefined as any) as AP)
            : a.metaPrime(dBatch, batch),
      }
    },
    prime(dn: number, n: number, meta, i) {
      return b.prime(a.prime(dn, n, meta.left, i), n, meta.right, i)
    },
  }
}

export function mixActivations<As extends Activation<any, any>[]>(
  ...activations: As
) {}

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
    const output = this.transforms.reduce<number[]>(
      <F>(
        output: number[],
        { weights, activation: { metaFeed, feed } }: Transformation<F, any>,
      ) => {
        const rawBatch = rowMulMat(output, weights)
        const batchMeta: F = metaFeed
          ? metaFeed(rawBatch)
          : ((undefined as any) as F)
        const activatedBatch = mapRow(rawBatch, (x, i) => feed(x, batchMeta, i))

        feedTrace.push({ rawBatch, activatedBatch, batchMeta })

        return activatedBatch
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

    for (let {
      feedTrace: { rawBatch, activatedBatch, batchMeta },
      error,
    } of feedBack) {
      const delta = mapRow(error, n => (n * this.lr) / feedBack.length)
      this.transforms.reduceRight(
        (
          delta: number[],
          { weights, activation: { prime } }: Transformation,
          i: number,
        ) => {
          // NOTE: add to a blank matrix for storing deltas
          // NOTE: when batching
          const changes = colMulRow(activatedBatch[i], delta)
          matAddMat(updates[i], changes)
          const nextDelta = rowZip(
            matMulCol(weights, delta),
            mapRow(feedTrace[i], (x, i) => prime(delta[i], x, meta, i)),
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
