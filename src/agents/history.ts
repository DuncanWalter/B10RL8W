import { History } from '../simulator'

export type FeedBack<F> = {
  actual: number
  expected: number
  trace: F
}

export function interpretHistory<F>(
  history: History<F>[],
): {
  reward: number
  feedBack: FeedBack<F>[]
} {
  if (history.length === 0) {
    throw new Error('Game history is empty or was not terminated')
  }

  const [head, ...tail] = history

  if (head.terminal) {
    return {
      reward: head.reward,
      feedBack: [],
    }
  } else {
    const rest = interpretHistory(tail)
    rest.feedBack.push({
      actual: rest.reward,
      expected: head.quality,
      trace: head.trace,
    })
    rest.reward += head.reward
    return rest
  }
}
