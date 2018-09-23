import { TransformationFactory } from '.'
import { vector, rowZip, add, mul } from '../batchMath'

export function biasTransform(
  seed: (i: number) => number = i =>
    i % 2 === 0 ? Math.random() : -Math.random(),
): TransformationFactory {
  return ({ size, serializedContent }) => {
    const weights = serializedContent
      ? JSON.parse(serializedContent)
      : vector(size, seed)
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
