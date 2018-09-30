test('some fast tooling for generating alternatives to SELU', () => {
  function n(z: number) {
    return Math.E ** (-0.5 * z ** 2) / Math.sqrt(2 * Math.PI)
  }

  function integral(f: (x: number) => number) {
    let sum = 0
    for (let i = -10; i <= 10; i += 0.05) {
      sum += 0.05 * f(i)
    }
    return sum
  }

  const activation = (a: number, b: number) => (x: number) => {
    let preScale
    if (x > 1) {
      preScale = 1 + (x * a - 1)
    } else if (x < -1) {
      preScale = -1 - (1 + x) * (a - 1)
    } else {
      preScale = x
    }

    return a * preScale - b

    // b * ((x > 0 ? x : 0) - a)
  }

  function solve(minA: number, maxA: number, minB: number, maxB: number) {
    const best = { error: Infinity, a: NaN, b: NaN }
    for (let i = 0; i < 15000; i++) {
      const a = Math.random() * (maxA - minA) + minA
      const b = Math.random() * (maxB - minB) + minB
      const f = activation(a, b)
      const me = integral(x => f(x) * n(x))
      const de = 1 - integral(x => f(x) ** 2 * n(x))
      const te = (me ** 2 + de ** 2) ** 0.5
      if (te < best.error) {
        best.error = te
        best.a = a
        best.b = b
      }
    }
    console.log(best)
    return best
  }

  const { a, b } = solve(1.1, 1.11, 0.128, 0.135)
  const f = activation(a, b)

  for (let m = -0.1; m <= 0.1; m += 0.01) {
    for (let s = 0.7; s <= 1.7; s += 0.1) {
      const om = integral(x => f(x) * n((x - m) / s))
      const os = m ** 2 - integral(x => f(x) ** 2 * n((x - m) / s))
      if (Math.abs(om) > Math.abs(m)) {
        console.log('instability:', om, m, s)
      }
    }
  }
})
