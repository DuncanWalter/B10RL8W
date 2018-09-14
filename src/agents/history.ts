import { State } from '../simulator'
import { Card } from '../simulator/card'
import { History, Player } from '../simulator/player'

export function interpretHistory(
  history: History[],
): {
  reward: number
  guesses: {
    actual: number
    expected: number
    state: State
    actor: Player
    action: Card
  }[]
} {
  if (history.length === 0) {
    throw new Error('Game history is empty or was not terminated')
  }

  const [head, ...tail] = history

  if (head.state === null || head.action === null) {
    return {
      reward: head.reward,
      guesses: [],
    }
  } else {
    const rest = interpretHistory(tail)
    rest.guesses.push({
      state: head.state,
      action: head.action,
      actor: head.actor,
      actual: rest.reward,
      expected: head.quality,
    })
    rest.reward += head.reward
    return rest
  }
}
