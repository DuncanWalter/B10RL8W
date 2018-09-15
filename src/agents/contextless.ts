import { Player } from '../simulator/player'
import { State } from '../simulator'
import { Card, card } from '../simulator/card'
import { range } from '../utils/range'
import transitions from '@material-ui/core/styles/transitions'
import { Agent } from '.'
import { FeedBack } from './history'

type ANN = {
  feed(
    input: number[],
  ): {
    feedTrace: number[][]
    output: number[]
  }
  backProp(feedBack: { feedTrace: number[][]; error: number[] }[]): void
}

// TODO: move to a state file in the simulator
// TODO: represent as only the 5 most interesting cards in hand
// TODO: also add one number saying how many cards there are in hand
function* handData(hand: Card[]): IterableIterator<number> {
  for (let i of range(13)) {
    yield* card.data(hand[i])
  }
}

// TODO: move to a state file in the simulator
// TODO: Represent as only a flag for whether the considered action would take
// TODO: the trick, size of trick, and the points in the trick
function* trickData({ cards }: { cards: Card[] }): IterableIterator<number> {
  for (let i of range(3)) {
    yield* card.data(cards[i])
  }
}

export function createContextlessAgent(net: ANN): Agent<number[][]> {
  return {
    policy({ trick }: State, player: Player, actions: Card[]) {
      // TODO: need to overhaul the state interpretations
      const stateData = [...handData(player.hand), ...trickData(trick)]
      return actions
        .map(action => [...stateData, ...card.data(action)])
        .map(data => net.feed(data as any))
        .map(({ feedTrace, output: [quality] }, index) => ({
          quality,
          trace: feedTrace,
          action: actions[index],
        }))
    },
    train(feedBack: FeedBack<number[][]>[]) {
      net.backProp(
        feedBack.map(({ expected, actual, trace }) => ({
          error: [actual - expected],
          feedTrace: trace,
        })),
      )
    },
  }
}
