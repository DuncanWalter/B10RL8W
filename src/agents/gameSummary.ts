import {
  State,
  Player,
  Card,
  suits,
  cardPoints,
  trickWinner,
} from '../simulator'
import { playerWithCard } from '../simulator/simulator'

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
 *  the number of points in the trick,
 *  the number of cards in the trick,
 *  whether the considered action would become the trick leader,
 *  the maximum number of pips for the leading card in the trick
 *  whether the trick is empty*/
export const trickSummary: GameSummary<5> = {
  size: 5,
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
    const trickIsEmpty = trick.cards.length === 0 ? 1 : 0
    return [points, cards, takesTrick, trickRank, trickIsEmpty]
  },
}

/** the summary of the action gives the agent:
 *  the suit of the card the agent is playing,
 *  the rank of the card the agent is playing
 *  the points of the card being played*/
export const actionSummary: GameSummary<6> = {
  size: 6,
  summary(state: State, player: Player, action: Card) {
    return [
      ...(Object.keys(suits) as (keyof typeof suits)[]).map(suit => {
        return action.suit === suits[suit] ? 1 : 0
      }),
      action.rank,
      cardPoints(action, state.simplified),
    ]
  },
}

/** the summary of the game's points and rules gives the agent:
 *  the agent's score,
 *  the total score,
 *  whether or not hearts has been broken,
 *  whether or not the queen is still in the game
 *  whether or not the agent has the queen */
export const ruleSummary: GameSummary<5> = {
  size: 5,
  summary(state: State, player: Player, action: Card) {
    let totalScore = 0
    for (let { score } of state.players) {
      totalScore += score
    }

    let queenTaken = 1
    if (
      !!playerWithCard(state.players, 'spades', 12) ||
      !!state.trick.cards.find(isQueenOfSpades)
    ) {
      queenTaken = 0
    }

    let haveQueen = 0
    player.hand.forEach(card => {
      if (isQueenOfSpades(card)) {
        haveQueen = 1
      }
    })

    return [
      player.score,
      totalScore,
      state.heartsBroken ? 1 : 0,
      queenTaken,
      haveQueen,
    ]
  },
}

function isQueenOfSpades(card: Card) {
  return card.suit === suits['spades'] && card.rank === 12
}

/** keeps track of the cards that have not yet been played
 *  (still in someone's hand) */
export const cardSummary: GameSummary<52> = {
  size: 52,
  summary(state: State, player: Player, action: Card) {
    const [hearts, spades, clubs, diamonds] = [0, 1, 2, 3].map(suit => {
      var ranks = new Array(13).fill(0)
      state.players.forEach(agent => {
        agent.hand.forEach(card => {
          if (card.suit === suit) {
            ranks[card.rank - 2] = 1 //lowest rank is 2 so subtract 2
          }
        })
      })
      return ranks
    })
    return [...hearts, ...spades, ...clubs, ...diamonds]
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
