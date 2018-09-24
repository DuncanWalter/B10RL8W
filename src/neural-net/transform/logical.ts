import { TransformationFactory } from '.'
import { pipeTransform } from './pipe'
import { splitTransform } from './split'
import { sigmoidTransform } from './sigmoid'
import { leakyReluTransform } from './leakyRelu'
import { biasTransform } from './bias'
import { denseTransform } from './dense'
import { guardTransform } from './guard'

// Meant to provide a basic building block for
// stable, expressive nets. Maybe stinks. Who knows.
export function logicalTransform(outputSize: number): TransformationFactory {
  return pipeTransform(
    biasTransform(),
    // guardTransform(),
    // splitTransform(
    //   { weight: 1, factory: sigmoidTransform() },
    //   {
    //     weight: 2,
    //     factory: leakyReluTransform(0),
    //   },
    // ),
    leakyReluTransform(0),
    // guardTransform(),
    denseTransform(outputSize),
    // guardTransform(),
  )
}
