import {
  Player,
  State,
  Trick,
  cardPoints,
  trickWinner,
  trickPoints,
  Card,
  card,
} from '../simulator'
import { Agent, FeedBack } from '.'

type ANN = {
  feed(
    input: number[],
  ): {
    feedTrace: number[][]
    output: number[]
  }
  backProp(feedBack: { feedTrace: number[][]; error: number[] }[]): void
  getWeights(): number[][][]
}

export type ANNSummary = {
  agentType: string
  qualityWeights: number[][][]
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

function trickData(
  trick: Trick,
  action: Card,
  simplified: boolean,
): Iterable<number> {
  return [
    // whether this action would take the trick
    trickWinner({ cards: [...trick.cards, action], suit: trick.suit }) ===
    action
      ? 1
      : 0,
    trick.cards.length,
    trickPoints(trick, simplified),
  ]
}

export function createContextlessAgent(
  net: ANN,
): Agent<number[][], ANNSummary> {
  return {
    policy({ trick, simplified }: State, player: Player, actions: Card[]) {
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
    summary() {
      return {
        agentType: 'contextless',
        qualityWeights: net.getWeights(),
      }
    },
  }
}
