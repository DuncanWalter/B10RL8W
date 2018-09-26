import { mapRow } from './batchMath'
import {
  TransformationFactory,
  pipeTransform,
  regularize,
  UniformTransformation,
} from './transform'

export default class NeuralNet {
  learningRate: number
  transform: UniformTransformation<any>

  constructor(
    config: {
      learningRate: number
      inputSize: number
      serializedContent?: string
    },
    ...transformFactories: TransformationFactory[]
  ) {
    this.learningRate = config.learningRate
    this.transform = regularize(
      pipeTransform(...transformFactories)({
        size: config.inputSize,
        serializedContent: config.serializedContent,
      }),
    )
  }

  passForward(
    input: number[],
  ): {
    output: number[]
    trace: unknown[]
  } {
    const { output, trace } = this.transform.passForward(input) as {
      output: number[]
      trace: unknown[]
    }
    return {
      output,
      trace,
    }
  }

  passBack(feedBack: { trace: unknown; error: number[] }[]) {
    for (let { trace, error } of feedBack) {
      const delta = mapRow(
        error,
        n => (n * this.learningRate) / feedBack.length,
      )
      this.transform.passBack(trace, delta)
    }
    this.transform.applyLearning()
  }

  serialize(): string {
    return this.transform.serialize()
  }
}
