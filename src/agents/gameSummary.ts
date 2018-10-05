import {
  State,
  Player,
  Card,
  suits,
  cardPoints,
  trickWinner,
} from '../simulator'

export type GameSummary<L extends number> = {
  size: L
  summary(state: State, player: Player, action: Card): Iterable<number>
}

/** the summary of the hand gives the agent:
 *  the sum of the all the pips in the hand, 
 *  the number of cards in the agent's hand, 
 *  the number of cards in each suit, 
 *  the minimum and maximum pip for a card in a suit */
export const handSummary: GameSummary<14> = {
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

/** the summary of the trick gives the agent: 
 *  number of points in the trick, 
 *  number of cards in the trick, 
 *  whether the considered action would become the trick leader, 
 *  the maximum number of pips for the leading card in the trick */
export const trickSummary: GameSummary<4> = {
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

/** the summary of the action gives the agent: 
 *  the suit of the card the agent is playing,
 *  the rank of the card the agent is playing */
export const actionSummary: GameSummary<5> = {
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

/** join a list of different game summaries */
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
