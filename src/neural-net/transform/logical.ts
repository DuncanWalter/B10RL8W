import { TransformationFactory } from '.'
import { pipeTransform } from './pipe'
import { splitTransform } from './split'
import { leakyReluTransform } from './leakyRelu'
import { biasTransform } from './bias'
import { denseTransform } from './dense'
import { sharpTanhTransform } from './sharpTanh'

/** Packages a bias, activation (leakyReLU), and dense layer into a single
 * "layer", to make net constructing simpler
 */

export function logicalTransform(outputSize: number): TransformationFactory {
  return pipeTransform(
    biasTransform(),
    // splitTransform(
    //   { weight: 1, factory: sharpTanhTransform() },
    //   {
    //     weight: 3,
    //     factory: leakyReluTransform(),
    //   },
    // ),
    leakyReluTransform(),
    // biasTransform(),
    denseTransform(outputSize),
  )
}
