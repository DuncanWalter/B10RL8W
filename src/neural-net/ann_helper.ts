import Math from 'mathjs'

export function sigmoid(n: number) {
  return 1 / (1 + Math.exp(-n))
}

export function sigmoidDeriv(n: number) {
  return sigmoid(n) * (1 - sigmoid(n))
}

export function softMax(ary: number[]) {
  return ary.map(
    n => Math.exp(n) / ary.map(m => Math.exp(n)).reduce((x, y) => x + y),
  )
}

export function transpose(ary: number[][]) {
  return ary.map((row, index) => ary.map(row => row[index]))
}
