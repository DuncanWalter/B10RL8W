import * as Math from 'mathjs'

function colMulRow(col: number[], row: number[]): number[][] {
  const width = row.length
  const height = col.length
  const output: number[][] = new Array(width)
  for (let i = 0; i < width; i++) {
    const outputColumn: number[] = new Array(height)
    for (let j = 0; j < height; j++) {
      outputColumn[j] = row[i] * col[j]
    }
    output[i] = outputColumn
  }
  return output
}

// function rowMulCol(row: number[], col: number[]): number[][] {
//   // TODO
// }

function vector(length: number, seed: () => number): number[] {
  const output = new Array(length)
  for (let i = 0; i < length; i++) {
    output[i] = seed()
  }
  return output
}

function matrix(width: number, height: number, seed: () => number): number[][] {
  const output = new Array(width)
  for (let i = 0; i < width; i++) {
    output[i] = vector(height, seed)
  }
  return output
}

// function rowMulMat(row: number[], mat: number[][]): number[] {
//   // TODO
// }
// function matMulCol(mat: number[][], col: number[]): number[] {
//   // TODO
// }
// function mapRow(row: number[], fun: (n: number) => number): void {
//   // TODO
// }
// function matAddMat(a: number[][], b: number[][]): void {
//   // TODO
// }

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
      const weights: number[][] = matrix(bandwidth[i], bandwidth[i + 1], seed)
      transforms[i] = { weights, activation: activationLayers[i].activation }
    }

    return transforms
  }

  feed(input: number[]): { output: number[]; feedTrace: number[][] } {
    const feedTrace: number[][] = [input]
    const output = this.transforms.reduce(
      (output: number[], { weights, activation: { feed } }: Transformation) => {
        const activationLayer = (Math.multiply(
          output,
          weights,
        ) as number[]).map(feed)
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

  backProp({ feedTrace, error }: { feedTrace: number[][]; error: number[] }) {
    const delta = Math.multiply(error, this.lr) as number[]
    this.transforms.reduceRight(
      (
        delta: number[],
        { weights, activation: { prime } }: Transformation,
        i: number,
      ) => {
        // TODO add to a blank matrix for storing deltas

        const newWeights = Math.add(
          weights,
          colMulRow(delta, feedTrace[i]),
        ) as number[][]

        this.transforms[i].weights = newWeights

        const nextDelta = Math.dotMultiply(
          Math.multiply(delta, Math.transpose(newWeights)),
          feedTrace[i].map(prime),
        ) as number[]
        return nextDelta
      },
      delta,
    )
  }
}
