import { TransformationFactory } from '.'
import {
  matrix,
  matAddMat,
  matMulCol,
  colMulRow,
  rowMulMat,
} from '../batchMath'

export function denseTransform(
  outputSize: number,
  seed: (i: number, j: number) => number = (i, j) =>
    (i + j) % 2 === 0 ? Math.random() : -Math.random(),
): TransformationFactory {
  return ({ size: inputSize, serializedContent }) => {
    const weights = serializedContent
      ? JSON.parse(serializedContent)
      : matrix(outputSize, inputSize, seed)
    let deltas = matrix(outputSize, inputSize, () => 0)
    return {
      passForward(batch) {
        return rowMulMat(batch, weights)
      },
      passBack(batch: number[], error) {
        matAddMat(deltas, colMulRow(batch, error))
        return matMulCol(weights, error)
      },
      applyLearning() {
        matAddMat(weights, deltas)
        deltas = matrix(outputSize, inputSize, () => 0)
      },
      serialize() {
        return JSON.stringify(weights)
      },
      size: outputSize,
    }
  }
}
