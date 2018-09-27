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
  passForward(
    input: number[],
  ): {
    trace: unknown
    output: number[]
  }
  passBack(feedBack: { trace: unknown; error: number[] }[]): void
  serialize(): string
}

export type ANNSummary = {
  agentType: string
  content: string
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

export function createContextlessAgent(net: ANN): Agent<unknown, ANNSummary> {
  return {
    policy(state: State, player: Player, actions: Card[]) {
      return actions
        .map(action => [...contextlessSummary.summary(state, player, action)])
        .map(data => net.passForward(data))
        .map(({ trace, output: [quality] }, index) => ({
          quality,
          trace: trace,
          action: actions[index],
        }))
    },
    train(feedBack: FeedBack<unknown>[]) {
      net.passBack(
        feedBack.map(({ expected, actual, trace }) => ({
          error: [Math.max(-6, Math.min(actual - expected, 6))],
          trace: trace,
        })),
      )
    },
    summary() {
      return {
        agentType: 'contextless',
        content: net.serialize(),
      }
    },
  }
}
