test('some fast tooling for generating alternatives to SELU', () => {
  function memoize(f: (x: number) => number): (x: number) => number {
    const answers = new Map()
    return x => {
      const a = answers.get(x)
      if (a !== undefined) {
        return a
      } else {
        const a = f(x)
        answers.set(x, a)
        return a
      }
    }
  }

  const n = memoize(function n(z: number) {
    return Math.E ** (-0.5 * z ** 2) / Math.sqrt(2 * Math.PI)
  })

  function integral(f: (x: number) => number) {
    let sum = 0
    for (let i = -10; i <= 10; i += 0.05) {
      sum += 0.05 * f(i)
    }
    return sum
  }

  function zoom(
    factor: number,
    activation: (x: number) => number,
  ): (x: number) => number {
    return x => factor * activation(x / factor)
  }

  const activation = (a: number, b: number) => (x: number) => {
    // sharp-tanh
    if (x > 1) {
      return (x - 1) * b + a
    } else if (x < -1) {
      return (x + 1) * b - a
    } else {
      return x * a
    }

    // relu thingy
    // if (x > 1) {
    //   return (x - x) * b + x
    // } else if (x > 0) {
    //   return a * x
    // } else {
    //   return b * x
    // }
  }

  function solve(
    minA: number,
    maxA: number,
    minB: number,
    maxB: number,
    minC: number,
    maxC: number,
  ) {
    const best = { error: Infinity, a: NaN, b: NaN, c: NaN }
    for (let i = 0; i < 5000; i++) {
      const a = Math.random() * (maxA - minA) + minA
      const b = Math.random() * (maxB - minB) + minB
      const c = Math.random() * (maxC - minC) + minC
      const f = zoom(c, activation(a, b))

      let e = 0

      for (let mu = 0; mu <= 2; mu += 0.1) {
        for (let sigma = 0.2; sigma <= 5; sigma *= 1.25) {
          let m = integral(x => f((x + mu) * sigma) * n(x))
          if (m - mu > 0 === mu > 0) {
            m *= 2
          }
          let s = 1 - integral(x => f((x + mu) * sigma) ** 2 * n(x))
          if (s / sigma > 1 === sigma > 1) {
            s *= 2
          }
          e += m * m + s * s
        }
      }

      if (e < best.error) {
        best.error = e
        best.a = a
        best.b = b
        best.c = c
      }
    }
    return best
  }

  const { a, b, c } = solve(0, 1.8, 0.1, 0.1, 0.1, 0.9)

  console.log('best', a.toFixed(5), b.toFixed(5), c.toFixed(5))
  // const f = activation(a, b)

  // for (let m = -0.1; m <= 0.1; m += 0.01) {
  //   for (let s = 0.7; s <= 1.7; s += 0.1) {
  //     const om = integral(x => f(x) * n((x - m) / s))
  //     const os = m ** 2 - integral(x => f(x) ** 2 * n((x - m) / s))
  //     if (Math.abs(om) > Math.abs(m)) {
  //       console.log('instability:', om, m, s)
  //     }
  //   }
  // }
})
