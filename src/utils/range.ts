export function range(n: number): number[] {
  const arr = Array(n)
  for (let i = 0; i < n; i++) {
    arr[i] = i
  }
  return arr
}
