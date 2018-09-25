import { TransformationFactory } from '.'
import { vector, mapRow } from '../batchMath'

export function guardTransform(): TransformationFactory {
  return ({ size, serializedContent }) => {
    let min = vector(size, () => Infinity)
    let max = vector(size, () => -Infinity)
    if (serializedContent) {
      ;({ min, max } = JSON.parse(serializedContent))
    }
    return {
      passForward(x: number[]) {
        return mapRow(x, (x, i) => {
          max[i] = Math.max(x, max[i])
          min[i] = Math.min(x, min[i])
          if (min[i] === max[i]) return 0
          return x / (max[i] - min[i]) - min[i]
        })
      },
      passBack(x: number[], error: number[]) {
        return mapRow(error, (e, i) => {
          return e * (max[i] - min[i])
        })
      },
      applyLearning() {},
      serialize(): string {
        return JSON.stringify({ min, max })
      },
      size,
    }
  }
}
