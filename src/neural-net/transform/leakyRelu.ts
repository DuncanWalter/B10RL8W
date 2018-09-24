import { TransformationFactory } from '.'
import { mapRow } from '../batchMath'

export function leakyReluTransform(): TransformationFactory<number[]> {
  return ({ size }) => ({
    passForward(batch) {
      return mapRow(batch, x => (x > 0 ? x : x * 0.05))
    },
    passBack(batch, error) {
      return mapRow(batch, (x, i) => (x > 0 ? error[i] : error[i] * 0.05))
    },
    applyLearning() {},
    serialize() {
      return 'null'
    },
    size,
  })
}
