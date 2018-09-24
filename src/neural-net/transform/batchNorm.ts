import { TransformationFactory } from '.'
import { mapRow, vector } from '../batchMath'

const epsilon = 10 ** -12

// function mean(vec: number[]) {
//   let sum = 0
//   for (let i = 0; i < vec.length; i++) {
//     sum += vec[i]
//   }
//   return sum / vec.length
// }

// function variance(vec: number[], _mean?: number) {
//   const mu = _mean === undefined ? mean(vec) : _mean
//   let sum = 0
//   for (let i = 0; i < vec.length; i++) {
//     const dif = vec[i] - mu
//     sum += dif * dif
//   }
//   return sum / vec.length
// }

// function sum(i: number, v: (i: number) => number) {
//   let sum = 0
//   for (let j = 0; j < i; j++) {
//     sum += v(j)
//   }
//   return sum
// }

function cacheReduce(retention: number, cache: number, input: number): number {
  if (cache !== cache) {
    return input
  } else {
    return retention * cache + (1 - retention) * input
  }
}

export function batchNormTransform(
  startScale = 1,
  startShift = 0,
  retention = 0.97,
): TransformationFactory {
  return ({ size, serializedContent }) => {
    let scale = vector(size, () => startScale)
    let shift = vector(size, () => startShift)
    let mu = vector(size, () => NaN)
    let sigma = vector(size, () => NaN)
    let dif = vector(size, () => NaN)

    if (serializedContent) {
      ;({ scale, shift, mu, sigma, dif } = JSON.parse(serializedContent))
    }

    let scalePrime = vector(size, (_, i) => scale[i])
    let shiftPrime = vector(size, (_, i) => shift[i])
    let muPrime = vector(size, (_, i) => mu[i])
    // TODO this will not load correctly- needs another serialized trait?
    let sigma2Prime = vector(size, (_, i) => sigma[i])
    let difPrime = vector(size, (_, i) => dif[i])

    return {
      passForward(x: number[]) {
        return mapRow(
          x,
          (x, i): number => {
            muPrime[i] = cacheReduce(retention, muPrime[i], x)
            sigma2Prime[i] = cacheReduce(
              retention,
              sigma2Prime[i],
              (x - muPrime[i]) ** 2,
            )
            difPrime[i] = cacheReduce(retention, difPrime[i], x - mu[i])
            return (scale[i] * (x - mu[i])) / sigma[i] + shift[i]
          },
        )
      },
      passBack(x: number[], error: number[]) {
        const len = error.length
        if (len === 0) return []

        return mapRow(x, (x, i) => {
          const dSigma2 =
            scale[i] * dif[i] - 1 / (2 * sigma[i] * sigma[i] * sigma[i])
          const dMu = (scale[i] * error[i]) / sigma[i] - 2 * dif[i] * dSigma2
          const out =
            (scale[i] * error[i]) / sigma[i] +
            (2 * dSigma2 * dif[i]) / len +
            dMu / len

          scalePrime[i] += (2 * error[i] * dif[i]) / sigma[i]
          shiftPrime[i] += error[i] / len

          return out
        })

        // const dSigma2 = sum(
        //   len,
        //   i =>
        //     scale * error[i] * (batch[i] - mu) * (-0.5 / sigma / sigma / sigma),
        // )

        // const dMu =
        //   -sum(len, i => (scale * error[i]) / sigma) +
        //   (dSigma2 * sum(len, i => batch[i] - mu) * -2) / len

        // const output = mapRow(batch, (x, i) => {
        //   return (
        //     (scale * error[i]) / sigma +
        //     (dSigma2 * 2 * (batch[i] - mu)) / len +
        //     dMu / len
        //   )
        // })

        // dScale += sum(len, i => (error[i] * (batch[i] - mu)) / sigma) / len
        // dShift += sum(len, i => error[i]) / len

        // return output
      },
      applyLearning() {
        mapRow(scale, (scale, i) => scalePrime[i], scale)
        mapRow(shift, (shift, i) => shiftPrime[i], shift)
        mapRow(mu, (mu, i) => muPrime[i], mu)
        mapRow(sigma, (sigma, i) => (sigma2Prime[i] + epsilon) ** 0.5, sigma)
        mapRow(dif, (dif, i) => difPrime[i], dif)

        // scale += dScale
        // shift += dShift
        // dScale = 0
        // dShift = 0
      },
      serialize() {
        return JSON.stringify({
          scale,
          shift,
          mu,
          sigma,
          dif,
        })
      },
      size,
    }
  }
}
