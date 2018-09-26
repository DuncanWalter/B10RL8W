import { TransformationFactory } from '.'
import { mapRow } from '../batchMath'

export function sigmoid(n: number) {
  return 2 / (1 + Math.exp(-n)) - 1
}

export function sigmoidPrime(n: number) {
  const sig = sigmoid(n)
  return 2 * sig * (1 - sig)
}

export function sigmoidTransform(): TransformationFactory {
  return ({ size }) => ({
    type: 'simplified',
    passForward(input: number[]) {
      return mapRow(input, sigmoid)
    },
    passBack(input: number[], error: number[]) {
      return mapRow(error, (e, i) => sigmoidPrime(input[i]) * e)
    },
    size,
  })
}
