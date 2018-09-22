import { Player, State, Card } from '../simulator'
import { Agent } from '.'

// TODO: make an actual prng (or import)
function seededRandom(seed: number) {
  return Math.random
}

export function createRandomAgent(seed: number): Agent<number, null> {
  const random = seededRandom(seed)
  return {
    policy(state: State, player: Player, actions: Card[]) {
      return actions.map(action => ({
        action,
        quality: random(),
        trace: player.score,
      }))
    },
    train(feedBack: any) {
      return
    },
    summary() {
      return null
    },
  }
}
