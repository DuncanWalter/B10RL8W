import { TransformationFactory } from '.'
import { vector, rowZip, add, mul } from '../batchMath'

export function biasTransform(
  seed: (i: number, n: number) => number = (i, n) =>
    (i % 2 === 0 ? 1 : -1) * Math.random() * Math.sqrt(6 / n),
): TransformationFactory {
  return ({ size, serializedContent }) => {
    const weights = serializedContent
      ? JSON.parse(serializedContent)
      : vector(size, i => seed(i, size))
    let deltas = vector(size, () => 0)
    return {
      passForward(batch) {
        return rowZip(batch, weights, add)
      },
      passBack(batch: number[], error) {
        rowZip(deltas, rowZip(batch, error, mul), add, deltas)
        return error
      },
      applyLearning() {
        rowZip(weights, deltas, add, weights)
        deltas = vector(size, () => 0)
      },
      serialize() {
        return JSON.stringify(weights)
      },
      size,
    }
  }
}
