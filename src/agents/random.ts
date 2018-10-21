import { Player, State, Card } from '../simulator'
import { Agent } from '.'

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
