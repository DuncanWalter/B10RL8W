import { Player, Policy } from '../simulator/player'
import { State } from '../simulator'
import { Card, card } from '../simulator/card'
import { range } from '../utils/range'

type NN<I extends number, O extends number> = {
  feed(input: number[] & { length: I }): number[] & { length: O }
}

// TODO: move to a state file in the simulator
function* handData(hand: Card[]): IterableIterator<number> {
  for (let i of range(13)) {
    yield* card.data(hand[i])
  }
}

// TODO: move to a state file in the simulator
// TODO: consider representing as only the current winning card of the trick?
// TODO: or as winning card and trick point total?
function* trickData({ cards }: { cards: Card[] }): IterableIterator<number> {
  for (let i of range(3)) {
    yield* card.data(cards[i])
  }
}

export function createContextlessPolicy(net: NN<102, 1>): Policy {
  return ({ trick }: State, player: Player, actions: Card[]) => {
    const stateData = [...handData(player.hand), ...trickData(trick)]
    return (
      actions
        .map(action => [...stateData, ...card.data(action)])
        // TODO: need some length utilities
        .map(data => net.feed(data as any))
        .map(([quality], index) => ({
          quality,
          card: actions[index],
        }))
    )
  }
}
