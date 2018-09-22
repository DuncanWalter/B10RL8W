declare interface Array<T> {
  generate<U>(gen: (item: T) => IterableIterator<U>): IterableIterator<U>
}

Array.prototype.generate = function* generate<T, U>(
  this: T[],
  gen: (item: T) => IterableIterator<U>,
): IterableIterator<U> {
  for (let item of this) {
    yield* gen(item)
  }
}
