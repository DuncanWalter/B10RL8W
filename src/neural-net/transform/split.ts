import { TransformationFactory, Transformation } from '.'
import { mapRow } from '../batchMath'
import { identityTransform } from './identity'

export function splitTransform(
  ...transformFactories: (
    | TransformationFactory
    | { transformFactory: TransformationFactory; weight: number })[]
): TransformationFactory {
  if (transformFactories.length === 0) {
    return identityTransform()
  }
  return ({ size, serializedContent }) => {
    const totalWeight = transformFactories.reduce((total, factory) => {
      if (factory instanceof Function) {
        return total + 1
      } else {
        return total + factory.weight
      }
    }, 0)

    const transformSlices = transformFactories.scan(
      ({ inNext, outNext }, factory, i) => {
        if (factory instanceof Function) {
          const length = Math.round(size / totalWeight)
          return {
            start: inNext,
            next: inNext + length,
            length,
            transform: factory({ size: length }),
          }
        } else {
          const length = Math.round((size * factory.weight) / totalWeight)
          return {
            start: inNext,
            next: inNext + length,
            length,
            transform: factory.transformFactory({ size: length }),
          }
        }
      },
      { inNext: 0, outNext },
    )

    return {
      passForward(batch: number[]) {
        const outputs = mapRow(transformSlices, transform => {
          const {
            start,
            length,
            transform: { passForward },
          } = transform
          const miniBatch = batch.slice(start, length)
          const output = passForward(miniBatch)
          if (output instanceof Array) {
            return {
              output,
              trace: miniBatch,
            }
          } else {
            return {
              output: output.output,
              trace: output.trace,
            }
          }
        })
        const output = Array.prototype.concat.apply(
          [],
          mapRow(outputs, acc => acc.output),
        )
        return {
          output,
          trace: outputs.reduce(
            (traces, output) => {
              traces.push(output.trace)
              return traces
            },
            [] as unknown[],
          ),
        }
      },
      passBack(traces: unknown[], error: number[]): number[] {
        const outputs = transforms.scan(
          ({ allocatedIn, allocatedOut }, { inCount, outCount, transform }) => {
            const { output, changes } = transform.passBack(
              batch.slice(allocatedIn, allocatedIn + inCount),
              error.slice(allocatedOut, allocatedOut + outCount),
            )
            return {
              result: output,
              changes,
              allocatedIn: allocatedIn + inCount,
              allocatedOut: allocatedOut + outCount,
            }
          },
          { allocatedIn: 0, allocatedOut: 0 },
        )
        const changes = mapRow(outputs, acc => acc.changes)
        const output = Array.prototype.concat.apply(
          [],
          mapRow(outputs, acc => acc.result, outputs),
        )
        return {
          changes,
          output,
        }
      },
      applyLearning(): void {
        transforms.forEach(trans => trans.transform.applyLearning())
      },
      serialize(): string {
        return JSON.stringify(
          transforms.map(trans => trans.transform.serialize()),
        )
      },
      size: 0,
    }
  }
}
