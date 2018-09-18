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

// NOTE: should avoid for most performance reasons
// export function transpose(ary: number[][]) {
//   return ary.map((row, index) => ary.map(row => row[index]))
// }

export function colMulRow(col: number[], row: number[]): number[][] {
  const width = row.length
  const height = col.length
  const output: number[][] = new Array(width)
  for (let i = 0; i < width; i++) {
    const outputColumn: number[] = new Array(height)
    for (let j = 0; j < height; j++) {
      outputColumn[j] = row[i] * col[j]
    }
    output[i] = outputColumn
  }
  return output
}

export function vector(length: number, seed: () => number): number[] {
  const output = new Array(length)
  for (let i = 0; i < length; i++) {
    output[i] = seed()
  }
  return output
}

export function matrix(
  width: number,
  height: number,
  seed: () => number,
): number[][] {
  const output = new Array(width)
  for (let i = 0; i < width; i++) {
    output[i] = vector(height, seed)
  }
  return output
}

export function rowMulCol(row: number[], col: number[]): number {
  let output = 0
  for (let i = 0; i < row.length; i++) {
    output += row[i] * col[i]
  }
  return output
}

export function rowMulMat(row: number[], mat: number[][]): number[] {
  const output = new Array(mat.length)
  for (let i = 0; i < mat.length; i++) {
    let sum = 0
    const matCol = mat[i]
    for (let j = 0; j < row.length; j++) {
      sum += matCol[j] * row[j]
    }
    output[i] = sum
  }
  return output
}

export function matMulCol(mat: number[][], col: number[]): number[] {
  if (mat.length === 0) {
    return []
  }
  const height = mat[0].length
  const output = new Array(height)
  for (let j = 0; j < height; j++) {
    let sum = 0
    for (let i = 0; i < mat.length; i++) {
      sum += mat[i][j] * col[i]
    }
    output[j] = sum
  }
  return output
}

export function mapRow(
  row: number[],
  fun: (n: number) => number,
  out?: number[],
): number[] {
  const output = out !== undefined ? out : new Array(row.length)
  const length = row.length
  for (let i = 0; i < length; i++) {
    output[i] = fun(row[i])
  }
  return output
}

// updates the left matrix with new values
export function matAddMat(a: number[][], b: number[][]): void {
  const width = a.length
  for (let i = 0; i < width; i++) {
    const column = a[i]
    const deltas = b[i]
    for (let j = 0; j < column.length; j++) {
      column[j] += deltas[j]
    }
  }
}

export function rowZip(
  a: number[],
  b: number[],
  zip: (a: number, b: number) => number,
  out?: number[],
): number[] {
  const output = out !== undefined ? out : new Array(a.length)
  for (let i = 0; i < a.length; i++) {
    output[i] = zip(a[i], b[i])
  }
  return output
}
