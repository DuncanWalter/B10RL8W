import { TransformationFactory } from '.'

export function identityTransform(): TransformationFactory {
  return ({ size }) => ({
    passForward(batch) {
      return batch
    },
    passBack(batch, error) {
      return error
    },
    applyLearning() {},
    serialize() {
      return 'null'
    },
    size,
  })
}
