import { TransformationFactory } from '.'
import '../../utils/arrayScan'
import { identityTransform } from './identity'

export function pipeTransform(
  ...transformFactories: TransformationFactory[]
): TransformationFactory {
  if (transformFactories.length === 0) {
    return identityTransform()
  }
  return ({ size, serializedContent }) => {
    const content = serializedContent ? JSON.parse(serializedContent) : []
    const transforms = transformFactories.scan(
      ({ size }, transformFactory, i) => {
        return transformFactory({ size, serializedContent: content[i] })
      },
      { size },
    )
    return {
      passForward(batch: number[]) {
        const traces = transforms.scan(
          ({ output: batch }, { passForward }) => {
            const output = passForward(batch)
            if (output instanceof Array) {
              return { output, trace: batch }
            } else {
              return { output: output.output, trace: output.trace }
            }
          },
          { output: batch },
        )
        // console.log(traces)
        return {
          trace: traces,
          output: traces[traces.length - 1].output,
        }
      },
      passBack(traces: any, error: number[]) {
        return transforms.reduceRight((error, { passBack }, i) => {
          const n = passBack(traces[i].trace, error)
          // console.log(n)
          return n
        }, error)
      },
      applyLearning() {
        transforms.forEach(({ applyLearning }) => applyLearning())
      },
      serialize() {
        return JSON.stringify(transforms.map(({ serialize }) => serialize()))
      },
      size: transforms[transforms.length - 1].size,
    }
  }
}
