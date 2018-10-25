export function sum(xs: number[], fun?: (x: number, i: number) => number) {
  let sum = 0
  for (let i = 0; i < xs.length; i++) {
    sum += fun ? fun(xs[i], i) : xs[i]
  }
  return sum
}

export function mean(xs: number[]) {
  return sum(xs) / xs.length
}

export function dev(xs: number[]) {
  const mu = mean(xs)
  return sum(xs, x => (mu - x) ** 2) / xs.length
}

export function max<T>(xs: T[], fun: (x: T) => number): T | null {
  let best = null
  for (let x of xs) {
    if (best === null) {
      best = x
    } else if (fun(best) < fun(x)) {
      best = x
    }
  }
  return best
}
