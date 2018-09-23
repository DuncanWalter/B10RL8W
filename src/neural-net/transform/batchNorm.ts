import { TransformationFactory } from '.'
import { mapRow } from '../batchMath'

const epsilon = 10 ** -12

function mean(vec: number[]) {
  let sum = 0
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i]
  }
  return sum / vec.length
}

function variance(vec: number[], _mean?: number) {
  const mu = _mean === undefined ? mean(vec) : _mean
  let sum = 0
  for (let i = 0; i < vec.length; i++) {
    const dif = vec[i] - mu
    sum += dif * dif
  }
  return sum / vec.length
}

function sum(i: number, v: (i: number) => number) {
  let sum = 0
  for (let j = 0; j < i; j++) {
    sum += v(j)
  }
  return sum
}

export function batchNormTransform(): TransformationFactory {
  return ({ size, serializedContent }) => {
    let scale = 1
    let shift = 0
    if (serializedContent) {
      ;({ scale, shift } = JSON.parse(serializedContent))
    }
    let dScale = 0
    let dShift = 0
    return {
      passForward(batch: number[]) {
        const mu = mean(batch)
        const sigma = Math.sqrt(variance(batch, mu) + epsilon)
        return mapRow(batch, x => (scale * (x - mu)) / sigma + shift)
      },
      passBack(batch: number[], error: number[]) {
        const len = error.length
        if (len === 0) return []
        const mu = mean(batch)
        const sigma = Math.sqrt(variance(batch, mu) + epsilon)

        const dSigma2 = sum(
          len,
          i =>
            scale * error[i] * (batch[i] - mu) * (-0.5 / sigma / sigma / sigma),
        )

        const dMu =
          -sum(len, i => (scale * error[i]) / sigma) +
          (dSigma2 * sum(len, i => batch[i] - mu) * -2) / len

        const output = mapRow(batch, (x, i) => {
          return (
            (scale * error[i]) / sigma +
            (dSigma2 * 2 * (batch[i] - mu)) / len +
            dMu / len
          )
        })

        dScale += sum(len, i => (error[i] * (batch[i] - mu)) / sigma) / len
        dShift += sum(len, i => error[i]) / len

        return output
      },
      applyLearning() {
        scale += dScale
        shift += dShift
        dScale = 0
        dShift = 0
      },
      serialize() {
        return JSON.stringify({
          scale,
          shift,
        })
      },
      size,
    }
  }
}
