import { History } from '../simulator/player'

export type FeedBack = {
  actual: number
  expected: number
  feedTrace: number[][]
}

export function interpretHistory(
  history: History[],
): {
  reward: number
  feedBack: FeedBack[]
} {
  if (history.length === 0) {
    throw new Error('Game history is empty or was not terminated')
  }

  const [head, ...tail] = history

  if (head.state === null || head.action === null) {
    return {
      reward: head.reward,
      feedBack: [],
    }
  } else {
    const rest = interpretHistory(tail)
    rest.feedBack.push({
      actual: rest.reward,
      expected: head.quality,
      feedTrace: head.feedTrace,
    })
    rest.reward += head.reward
    return rest
  }
}
