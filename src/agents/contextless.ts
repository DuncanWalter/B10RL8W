import { Player } from '../simulator/player'
import {
  State,
  Trick,
  cardPoints,
  trickWinner,
  trickPoints,
} from '../simulator'
import { Card, card } from '../simulator/card'
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

function* joinIterables(
  a: Iterable<number>,
  b: Iterable<number>,
): IterableIterator<number> {
  yield* a
  yield* b
}

// TODO: could also count the number of each suit in hand
function handData(hand: Card[], simplified: boolean): Iterable<number> {
  return hand
    .map(card => ({
      card,
      score: card.rank + (cardPoints(card, simplified) === 0 ? 0 : 5),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(({ card: obj }) => card.data(obj))
    .reduce(joinIterables, [hand.length])
}

// TODO: Represent as only a flag for whether the considered action would take
// TODO: the trick, size of trick, and the points in the trick
function trickData(
  trick: Trick,
  action: Card,
  simplified: boolean,
): Iterable<number> {
  return [
    trickWinner({ cards: [...trick.cards, action], suit: trick.suit }) ===
    action
      ? 1
      : 0,
    trick.cards.length,
    trickPoints(trick, simplified),
  ]
}

export function createContextlessAgent(net: ANN): Agent<number[][]> {
  return {
    policy({ trick, simplified }: State, player: Player, actions: Card[]) {
      // TODO: need to overhaul the state interpretations
      const hand = [...handData(player.hand, simplified)]
      return actions
        .map(action => [...hand, ...trickData(trick, action, simplified)])
        .map(data => net.feed(data))
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
