import {
  matrix,
  colMulRow,
  rowMulMat,
  mapRow,
  matAddMat,
  matMulCol,
} from './ann_helper'

export type Transformation<C> = {
  getRepresentation(): unknown
  storeChanges(changes: C): void
  applyChanges(): void
  feed(batch: number[]): number[]
  backProp(batch: number[], error: number[]): { output: number[]; changes: C }
}

type Trace = {
  batch: number[]
  output: number[]
}

export function denseTransform(
  inputSize: number,
  outputSize: number,
  seed: (i: number, j: number) => number = (i, j) =>
    (i + j) % 2 === 0 ? Math.random() : -Math.random(),
): Transformation<number[][]> {
  const weights = matrix(outputSize, inputSize, seed)
  let deltas = matrix(outputSize, inputSize, () => 0)
  return {
    feed(batch) {
      return rowMulMat(batch, weights)
    },
    backProp(batch, error) {
      return {
        changes: colMulRow(batch, error),
        output: matMulCol(weights, error),
      }
    },
    storeChanges(changes) {
      // console.log('changes', changes)
      matAddMat(deltas, changes)
    },
    applyChanges() {
      matAddMat(weights, deltas)
      // console.log('new weights', weights)
      deltas = matrix(outputSize, inputSize, () => 0)
    },
    getRepresentation() {
      return weights
    },
  }
}

export function reluTransform(): Transformation<null> {
  return {
    feed(batch) {
      return mapRow(batch, x => (x > 0 ? x : x / 10))
    },
    backProp(batch, error) {
      return {
        changes: null,
        output: mapRow(
          batch,
          (x, i) => (x > 0 ? error[i] * 1 : error[i] * 0.1),
        ),
      }
    },
    storeChanges() {},
    applyChanges() {},
    getRepresentation() {
      return null
    },
  }
}

export class Split_Vanilla_ANN<Ts extends Transformation<any>[]> {
  lr: number
  transforms: Ts

  constructor(lr: number, transforms: Ts) {
    this.lr = lr
    this.transforms = transforms
  }

  feed(
    input: number[],
  ): {
    output: number[]
    feedTrace: Trace[]
  } {
    const feedTrace: Trace[] = []
    const output = this.transforms.reduce<number[]>(
      <C>(batch: number[], { feed }: Transformation<C>) => {
        const output = feed(batch)
        feedTrace.push({ batch, output })
        return output
      },
      input,
    )
    return {
      output,
      feedTrace,
    }
  }

  backProp(feedBack: { feedTrace: Trace[]; error: number[] }[]) {
    for (let { feedTrace, error } of feedBack) {
      const delta = mapRow(error, n => (n * this.lr) / feedBack.length)
      this.transforms.reduceRight<number[]>(
        <C>(
          error: number[],
          { backProp, storeChanges }: Transformation<C>,
          i: number,
        ) => {
          // console.log('delta', error)

          const { changes, output } = backProp(feedTrace[i].batch, error)
          storeChanges(changes)
          return output
        },
        delta,
      )
    }
    this.transforms.forEach(({ applyChanges }) => applyChanges())
  }

  getRepresentation(): unknown[] {
    return this.transforms.map(({ getRepresentation }) => getRepresentation())
  }
}
