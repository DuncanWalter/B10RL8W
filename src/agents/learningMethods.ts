import { FeedBack } from '.'
import { validPlays } from '../simulator'
import { max } from '../utils/math'

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
export function DQNLearning(
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

/**Standard Q-Learning updating is an on-policy method
 * The update equation for policy pi: (a: action) => (s: state) is
 * Q(s, a) <- reward + max_{a': action}(Q(pi(a), a'))
 *
 * @author G. Eli Jergensen
 */
export function QLearning(
  errorFn: ErrorFunction,
  errorFnPrime: ErrorFunction,
): (
  feedback: FeedBack<unknown>[],
) => { error: number[]; trace: unknown; loss: number }[] {
  return feedback =>
    feedback.scan(
      ({ maxQ }, { expected, reward, trace, state, actor }) => ({
        error: [errorFnPrime(expected, reward + maxQ)],
        trace: trace,
        loss: errorFn(expected, reward + maxQ),
        maxQ: max(
          actor.policy(state, actor, validPlays(state, actor.hand)),
          ({ quality }) => quality,
        )!.quality,
      }),
      { maxQ: 0 },
    )
}

/**
 *
 * @author Kate Avery
 */
export function SARSALearning(
  errorFn: ErrorFunction,
  errorFnPrime: ErrorFunction,
): (
  feedbacks: FeedBack<unknown>[],
) => { error: number[]; trace: unknown; loss: number }[] {
  // recall that SARSA's update method is
  // Q(s, a) <- reward + Q(s', a')
  return feedbacks => {
    return feedbacks.scan(
      (next, current) => {
        return {
          expected: current.expected,
          error: [
            errorFnPrime(current.expected, next.expected + current.reward),
          ],
          trace: current.trace,
          loss: errorFn(current.expected, next.expected + current.reward),
        }
      },
      { expected: 0 },
    )
  }
}
