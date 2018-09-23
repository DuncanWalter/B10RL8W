export type Transformation<Trace = number[]> = {
  serialize(): string
  applyLearning(): void
  passForward(batch: number[]): number[] | { output: number[]; trace: Trace }
  passBack(batch: Trace, error: number[]): number[]
  size: number
}

export type TransformationFactory<Trace = unknown> = (
  info: { size: number; serializedContent?: string },
) => Transformation<Trace>

export { denseTransform } from './dense'
export { biasTransform } from './bias'
export { batchNormTransform } from './batchNorm'
export { leakyReluTransform } from './leakyRelu'
export { splitTransform } from './split'
export { pipeTransform } from './pipe'
export { sigmoidTransform } from './sigmoid'
