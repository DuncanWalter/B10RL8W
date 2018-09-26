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
  // Using Uniform Xavier initialization
  seed: (i: number, j: number, n: number) => number = (i, j, n) =>
    ((i + j) % 2 === 0 ? 1 : -1) *
    Math.random() *
    Math.sqrt(6 / (n + outputSize)),
): TransformationFactory {
  return ({ size: inputSize, serializedContent }) => {
    const weights = serializedContent
      ? JSON.parse(serializedContent)
      : matrix(outputSize, inputSize, (i, j) => seed(i, j, inputSize))
    let deltas = matrix(outputSize, inputSize, () => 0)
    return {
      type: 'simplified',
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
