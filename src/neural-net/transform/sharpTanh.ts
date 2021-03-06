import { TransformationFactory } from '.'
import { mapRow } from '../batchMath'

/** An activation layer which is linear outside of the center region, where it
 * instead has a certain non-zero slope. Effectively looks like 3-piece linear
 * approximation to the tanh function
 */

export function sharpTanhTransform(
  slope: number = 0.05,
): TransformationFactory {
  return ({ size }) => ({
    type: 'simplified',
    passForward(input) {
      return mapRow(input, x => {
        switch (true) {
          case x < 1: {
            return slope * (x + 1) - 1
          }
          case x > 1: {
            return slope * (x - 1) + 1
          }
          default: {
            return x
          }
        }
      })
    },
    passBack(input, error) {
      return mapRow(input, (x, i) => {
        if (Math.abs(x) > 1) {
          return error[i] * slope
        } else {
          return error[i]
        }
      })
    },
    size,
  })
}
