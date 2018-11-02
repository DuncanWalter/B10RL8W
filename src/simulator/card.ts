export const suits = {
  hearts: 0,
  spades: 1,
  clubs: 2,
  diamonds: 3,
}

export type Rank =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11 /*J*/
  | 12 /*Q*/
  | 13 /*K*/
  | 14 /*A*/

// NOTE: could be a Slice based class with statics later
export type Card = {
  suit: number
  rank: Rank
}

// NOTE: named function for stack traces (and secondarily for gpu kernel)
function createCard(suit: keyof typeof suits, rank: Rank): Card {
  return { suit: suits[suit], rank }
}

export const card = {
  create: createCard,
}
