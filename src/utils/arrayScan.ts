interface Array<T> {
  scan<T, U extends S, S>(this: T[], agg: (acc: S, item: T) => U, seed: S): U[]
}

Object.defineProperty(Array.prototype, 'scan', {
  value: function scan<T, U extends S, S>(
    this: T[],
    agg: (acc: S, item: T) => U,
    seed: S,
  ): U[] {
    const len = this.length
    const output: U[] = new Array(len)
    if (len === 0) {
      return output
    }
    output[0] = agg(seed, this[0])
    for (let i = 1; i < len; i++) {
      output[i] = agg(output[i - 1], this[i])
    }
    return output
  } as Array<any>['scan'],
  enumerable: false,
})
