import { Player, Policy } from '../simulator/player'
import { State } from '../simulator'
import { Card, card } from '../simulator/card'
import { range } from '../utils/range'

type ANN = {
  feed(
    input: number[],
  ): {
    feedTrace: number[][]
    output: number[]
  }
  backProp(feedBack: { feedTrace: number[][]; error: [] }[]): void
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

export function createContextlessPolicy(net: ANN): Policy {
  return ({ trick }: State, player: Player, actions: Card[]) => {
    const stateData = [...handData(player.hand), ...trickData(trick)]
    return (
      actions
        .map(action => [...stateData, ...card.data(action)])
        // TODO: need some length utilities
        .map(data => net.feed(data as any))
        .map(({ feedTrace, output: [quality] }, index) => ({
          quality,
          feedTrace,
          action: actions[index],
        }))
    )
  }
}
