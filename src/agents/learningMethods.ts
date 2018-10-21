import { FeedBack } from '.'

type ErrorFunction = (expected: number, actual: number) => number

export type LearningMethod = (
  errorFn: ErrorFunction,
  errorFnPrime: ErrorFunction,
) => (
  feedback: FeedBack<unknown>[],
) => { error: number[]; trace: unknown; loss: number }[]

/** Deep Q Network policy updating is an on-policy method
 * It compares the Q-Predictions of the Network for each action to the final reward at the end of the episode
 *
 * @author Duncan Walter
 */
export function DQN(
  errorFn: ErrorFunction,
  errorFnPrime: ErrorFunction,
): (
  feedback: FeedBack<unknown>[],
) => { error: number[]; trace: unknown; loss: number }[] {
  return (feedback: FeedBack<unknown>[]) => {
    return feedback.map(({ expected, actual, trace }) => ({
      error: [errorFnPrime(expected, actual)],
      trace,
      loss: errorFn(expected, actual),
    }))
  }
}
