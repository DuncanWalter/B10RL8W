import { TransformationFactory } from '.'

/** I do "nothing". I'm having an identity crisis! */

export function identityTransform(): TransformationFactory {
  return ({ size }) => ({
    type: 'simplified',
    passForward(input) {
      return input
    },
    passBack(input, error) {
      return error
    },
    size,
  })
}
