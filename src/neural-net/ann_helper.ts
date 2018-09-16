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

//NOT TESTED
export function crossEntropy(output: number[], yData: Math.Matrix) {
  let size = yData.size()[0]
  let smax = softMax(output)
  //let lLikelihood = -Math.log(smax[[...Array(size).keys()], yData)])
  //let loss = Math.sum(lLikelihood) / size
}

export function transpose(ary: number[][]) {
  return ary.map((row, index) => ary.map(row => row[index]))
}
