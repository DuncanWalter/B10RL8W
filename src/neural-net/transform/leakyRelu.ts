import { TransformationFactory } from '.'
import { mapRow } from '../batchMath'

/** Leaky ReLU activation function which takes the slope of the negative side
 * (positive side is just the identity)
 */

export function leakyReluTransform(
  slope: number = 0.05,
): TransformationFactory {
  return ({ size }) => ({
    type: 'simplified',
    passForward(input) {
      return mapRow(input, x => (x > 0 ? x : x * slope))
    },
    passBack(input, error) {
      return mapRow(input, (x, i) => (x > 0 ? error[i] : error[i] * slope))
    },
    size,
  })
}
