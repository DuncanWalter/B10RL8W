import * as Math from 'mathjs'

export function sigmoid(n: number) {
  return 1 / (1 + Math.exp(-n))
}

export function sigmoidDeriv(n: number) {
  return sigmoid(n) * (1 - sigmoid(n))
}

//NOT TESTED
export function softMax(ary: number[]) {
  let top = ary.map(j => Math.exp(j))
  return top.map(t => t / (Math.sum(ary.map(k => Math.exp(k))) as number))
}

//NOT TESTED on our data
export function mse(output: Math.Matrix, yData: Math.Matrix) {
  let n = yData.size()[0]
  let diff = Math.subtract(output, yData) as Math.Matrix
  let diffSqr = diff.map(d => Math.pow(d, 2))
  return Math.sum(diffSqr)
}

export function transpose(ary: number[][]) {
  return ary.map((row, index) => ary.map(row => row[index]))
}
