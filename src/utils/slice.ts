export interface Slice<L extends number> {
  buffer: Float32Array
  offset: number
  length: L
}

export class SliceWrapper<L extends number> {
  readonly slice: Slice<L>
  constructor(slice: Slice<L>) {
    this.slice = slice
  }
}

function createSlice<L extends number>(
  buffer: Float32Array,
  offset: number,
  length: L,
): Slice<L> {
  return {
    buffer,
    offset,
    length,
  }
}

function castSliceToArray<L extends number>(self: Slice<L>): number[] {
  const arr = new Array<number>(self.length)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = slice.get(self, i)
  }
  return arr
}

function sliceGet<L extends number>(self: Slice<L>, index: number): number {
  return self.buffer[self.offset + index]
}

function sliceSet<L extends number>(
  self: Slice<L>,
  index: number,
  value: number,
): void {
  self.buffer[self.offset + index] = value
}

export const slice = {
  create: createSlice,
  toArray: castSliceToArray,
  get: sliceGet,
  set: sliceSet,
}
