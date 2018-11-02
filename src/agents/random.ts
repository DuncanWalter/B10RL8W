import { Player, State, Card } from '../simulator'
import { Agent } from '.'

/**
 * Defines our random agents, which simply play the rightmost legal action
 * in their hand each turn. As the cards are never sorted after being shuffled,
 * this results in random play.
 */
export function createRandomAgent(): Agent<null> {
  return {
    policy(state: State, player: Player, actions: Card[]) {
      return actions.map((action, index) => ({
        action,
        quality: index,
        trace: null,
      }))
    },
    train(feedBack: unknown) {
      return {
        meanLoss: NaN,
        stdDevLoss: NaN,
      }
    },
    serialize() {
      return 'null'
    },
  }
}

export const randomAgent = createRandomAgent()
