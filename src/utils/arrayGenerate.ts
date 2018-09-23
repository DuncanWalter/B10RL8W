interface Array<T> {
  generate<U>(gen: (item: T) => IterableIterator<U>): IterableIterator<U>
}

Object.defineProperty(Array.prototype.generate, 'generate', {
  value: function* generate<T, U>(
    this: T[],
    gen: (item: T) => IterableIterator<U>,
  ): IterableIterator<U> {
    for (let item of this) {
      yield* gen(item)
    }
  },
  enumerable: false,
})
