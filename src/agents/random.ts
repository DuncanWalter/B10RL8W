import { Player, State, Card } from '../simulator'
import { Agent } from '.'

// // TODO: make an actual prng (or import)
// function seededRandom(seed: number) {
//   return Math.random
// }

export function createRandomAgent(seed: number): Agent<null, 'random'> {
  // const random = seededRandom(seed)
  return {
    type: 'random',
    policy(state: State, player: Player, actions: Card[]) {
      return actions.map((action, index) => ({
        action,
        quality: index,
        trace: null,
      }))
    },
    train(feedBack: any) {
      return {
        meanLoss: 0,
        stdDevLoss: 1,
      }
    },
    serialize() {
      return 'null'
    },
  }
}
