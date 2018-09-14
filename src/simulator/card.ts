import { range } from '../utils/range'

export const suits = {
  hearts: 0,
  spades: 1,
  clubs: 2,
  diamonds: 3,
}

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

// NOTE: could be a Slice based class with statics later
export type Card = {
  suit: number
  rank: Rank
}

// NOTE: named function for stack traces (and secondarily for gpu kernel)
function createCard(suit: keyof typeof suits, rank: Rank): Card {
  return { suit: suits[suit], rank }
}

// NOTE: currently using the most expressive "reasonable" form, which has 6
// components: exists, hearts, diamonds, spades, clubs, rank
function* cardData(card?: Card): IterableIterator<number> {
  if (card === undefined) {
    for (let i of range(Object.keys(suits).length + 2)) {
      yield 0
    }
  } else {
    yield 1
    for (let key of Object.keys(suits) as (keyof typeof suits)[]) {
      yield card.suit === suits[key] ? 1 : 0
    }
    yield card.rank
  }
}

export const card = {
  create: createCard,
  data: cardData,
}
