import { Player } from '../simulator/player'
import { State } from '../simulator'
import { Card } from '../simulator/card'
import { Agent } from '.'

// TODO: make an actual prng (or import)
const seedRandom: (seed: number) => () => number = (seed: number) => Math.random

export function createRandomAgent(seed: number): Agent<number> {
  const random = seedRandom(seed)
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
  }
}
