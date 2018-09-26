import { TransformationFactory } from '.'
import { mapRow } from '../batchMath'

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

const epsilon = 10 ** -12
export function layerNormTransform(): TransformationFactory {
  return ({ size, serializedContent }) => {
    let scale = 1
    let shift = 0
    let dScale = 0
    let dShift = 0
    return {
      type: 'simplified',
      passForward(input: number[]) {
        const mu = mean(input)
        const sigma = Math.sqrt(variance(input, mu) + epsilon)
        return mapRow(input, x => (scale * (x - mu)) / sigma + shift)
      },
      passBack(input: number[], error: number[]) {
        const len = error.length
        if (len === 0) {
          return []
        }
        const mu = mean(input)
        const sigma = Math.sqrt(variance(input, mu) + epsilon)
        const dSigma2 = sum(
          len,
          i =>
            scale * error[i] * (input[i] - mu) * (-0.5 / sigma / sigma / sigma),
        )
        const dMu =
          -sum(len, i => (scale * error[i]) / sigma) +
          (dSigma2 * sum(len, i => input[i] - mu) * -2) / len
        const output = mapRow(input, (x, i) => {
          return (
            (scale * error[i]) / sigma +
            (dSigma2 * 2 * (input[i] - mu)) / len +
            dMu / len
          )
        })
        // // TODO make it learn
        // const dScale = sum(len, i => (error[i] * (input[i] - mu)) / sigma) / len
        // const dShift = sum(len, i => error[i]) / len
        return output
      },
      size,
    }
  }
}
