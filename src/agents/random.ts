import { Policy, Player } from '../simulator/player'
import { State } from '../simulator'
import { Card } from '../simulator/card'

// TODO: make an actual prng (or import)
const seedRandom: (seed: number) => () => number = (seed: number) => Math.random

export function createRandomPolicy(seed: number): Policy {
  const random = seedRandom(seed)
  return (state: State, player: Player, actions: Card[]) => {
    return actions.map(card => ({ card, quality: random() }))
  }
}
