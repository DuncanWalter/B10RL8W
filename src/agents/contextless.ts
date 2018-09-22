import {
  Player,
  State,
  cardPoints,
  trickWinner,
  Card,
  suits,
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

export type GameSummary<L extends number> = {
  size: L
  summary(state: State, player: Player, action: Card): Iterable<number>
}

const handSummary: GameSummary<14> = {
  size: 14,
  summary(state: State, { hand: rawHand }: Player, action: Card) {
    const hand = rawHand.filter(card => card !== action)
    const pips = hand.reduce((pips, card) => pips + card.rank, 0)
    const cards = hand.length
    const [hearts, spades, clubs, diamonds] = [0, 1, 2, 3].map(suit => {
      let count = 0
      let min = 14
      let max = 2
      hand.forEach(card => {
        if (card.suit === suit) {
          count++
          max = Math.max(max, card.rank)
          min = Math.min(min, card.rank)
        }
      })
      return [count, min, max]
    })
    return [pips, cards, ...hearts, ...spades, ...clubs, ...diamonds]
  },
}

const trickSummary: GameSummary<4> = {
  size: 4,
  summary({ simplified, trick }: State, player: Player, action: Card) {
    const trickWithAction = [action, ...trick.cards]
    const points = trickWithAction.reduce(
      (points, card) => points + cardPoints(card, simplified),
      0,
    )
    const cards = trick.cards.length
    const takesTrick =
      trickWinner({ cards: trickWithAction, suit: trick.suit }) === action
        ? 1
        : 0
    const trickRank = (trickWinner(trick) || { rank: 0 }).rank
    return [points, cards, takesTrick, trickRank]
  },
}

const actionSummary: GameSummary<5> = {
  size: 5,
  summary(state: State, player: Player, action: Card) {
    return [
      ...(Object.keys(suits) as (keyof typeof suits)[]).map(suit => {
        return action.suit === suits[suit] ? 1 : 0
      }),
      action.rank,
    ]
  },
}

export function joinSummaries(
  ...summaries: GameSummary<number>[]
): GameSummary<number> {
  return {
    size: summaries.reduce((totalSize, { size }) => size + totalSize, 0),
    *summary(state: State, player: Player, action: Card) {
      for (let { summary } of summaries) {
        yield* summary(state, player, action)
      }
    },
  }
}

export const contextlessSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
)

export function createContextlessAgent(
  net: ANN,
): Agent<number[][], ANNSummary> {
  return {
    policy(state: State, player: Player, actions: Card[]) {
      return actions
        .map(action => [...contextlessSummary.summary(state, player, action)])
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
