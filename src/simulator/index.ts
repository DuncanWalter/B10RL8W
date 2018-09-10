const suits = {
  hearts: 0,
  spades: 1,
  clubs: 2,
  diamonds: 3,
}

type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

type Card = {
  suit: number
  rank: number
}

function createCard(suit: keyof typeof suits, rank: Rank): Card {
  return { suit: suits[suit], rank }
}

const card = {
  create: createCard,
}

type Player = {
  hand: Card[]
  score: number
  predictValue(state: State, action: Card): number
}

type Trick = {
  suit: number | null
  cards: Card[]
}

type State = {
  players: [Player, Player, Player, Player]
  trick: Trick
  heartsBroken: boolean
  simplified: boolean
  trickLeader: 0 | 1 | 2 | 3
}

function trickWinner({ suit, cards }: Trick): Card | null {
  return cards.reduce((winner: null | Card, card: Card) => {
    if (card.suit === suit && (winner === null || card.rank > winner.rank)) {
      return card
    } else {
      return winner
    }
  }, null)
}

function validPlays(
  { trick: { suit }, simplified, heartsBroken }: State,
  hand: Card[],
): Card[] {
  if (suit !== null) {
    const hasSuit = hand.reduce(
      (hasSuit, card) => hasSuit || card.suit === suit,
      false,
    )
    if (hasSuit) {
      return hand.filter(card => card.suit === suit)
    } else {
      return hand
    }
  } else if (simplified || heartsBroken) {
    return hand
  } else {
    return hand.filter(card => {
      const isHeart = card.suit === suits.hearts
      const isSpade = card.suit === suits.spades
      const isQueen = card.rank === 12
      return !(isHeart || (isQueen && isSpade))
    })
  }
}

function trickPoints({ trick: { cards }, simplified }: State): number {
  return cards.reduce((total, card) => {
    const isHeart = card.suit === suits.hearts
    const isSpade = card.suit === suits.spades
    const isQueen = card.rank === 12
    if (isHeart) {
      return total + 1
    } else if (!simplified && isQueen && isSpade) {
      return total + 13
    } else {
      return total
    }
  }, 0)
}

function playerWithCard(
  players: Player[],
  suit: keyof typeof suits,
  rank: number,
): Player | null {
  const player = players.find(
    player =>
      player.hand.find(
        card => card.suit === suits[suit] && card.rank === rank,
      ) !== undefined,
  )
  if (player !== undefined) {
    return player
  } else {
    return null
  }
}

function range(n: number): number[] {
  const arr = Array(n)
  for (let i = 0; i < n; i++) {
    arr[i] = i
  }
  return arr
}

function playCard(
  { trick: { cards } }: State,
  player: Player,
  play: Card,
): void {
  cards.push(play)
  player.hand = player.hand.filter(card => card !== play)
}

function playRound(state: State) {
  const {
    players,
    trickLeader,
    trick: { cards },
  } = state
  for (let i of range(4)) {
    const player = players[(trickLeader + i) % 4]
    const plays = validPlays(state, player.hand)
    const play = plays.reduce(
      (selection, card) => {
        const value = player.predictValue(state, card)
        if (selection === null || value > selection.value) {
          return { value, card, player }
        } else {
          return selection
        }
      },
      null as null | { value: number; player: Player; card: Card },
    )
    if (play !== null) {
      playCard(state, player, play.card)
      // TODO: Do stuff with recording state action qualities
    } else {
      throw new Error('No play was determined')
    }
  }
  const card = trickWinner(state.trick)
  const points = trickPoints(state)
  if (card) {
    const cardIndex = cards.indexOf(card)
    // TODO: use card location to pick a player
    // if (player !== undefined) {
    // } else {
    //   throw new Error('No trick winner could be determined at round end')
    // }
  } else {
    throw new Error('No trick winner could be determined at round end')
  }
}

// function playGame() {
//   let i = 0
//   while (i++ < 13) {
//     playRound()
//   }
// }
