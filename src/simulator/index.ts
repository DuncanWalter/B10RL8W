import { range } from '../utils/range'
import { Card, suits, card } from './card'
import { Player, Quality, createPlayer } from './player'

export type Trick = {
  suit: number | null
  cards: Card[]
}

export type State = {
  players: [Player, Player, Player, Player]
  trick: Trick
  heartsBroken: boolean
  simplified: boolean
  trickLeader: 0 | 1 | 2 | 3
}

export function trickWinner({ suit, cards }: Trick): Card | null {
  return cards.reduce((winner: null | Card, card: Card) => {
    if (card.suit === suit && (winner === null || card.rank > winner.rank)) {
      return card
    } else {
      return winner
    }
  }, null)
}

export function validPlays(
  {
    trick: { suit },
    simplified,
    heartsBroken,
  }: { trick: Trick; simplified: boolean; heartsBroken: boolean },
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
    const plays = hand.filter(card => cardPoints(card, simplified) === 0)
    return plays.length === 0 ? hand : plays
  }
}

function cardPoints(card: Card, simplified: boolean): number {
  const isHeart = card.suit === suits.hearts
  const isSpade = card.suit === suits.spades
  const isQueen = card.rank === 12
  if (isHeart) {
    return 1
  } else if (!simplified && isQueen && isSpade) {
    return 13
  } else {
    return 0
  }
}

export function trickPoints({
  trick: { cards },
  simplified,
}: {
  trick: Trick
  simplified: boolean
}): number {
  return cards.reduce((total, card) => total + cardPoints(card, simplified), 0)
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

function* freshDeck(): IterableIterator<Card> {
  for (let suit of Object.keys(suits) as (keyof typeof suits)[]) {
    for (let rank = 2; rank < 15; rank++) {
      yield card.create(suit, rank as any)
    }
  }
}

function shuffleDeck(deck: Card[], random: () => number = Math.random): void {
  for (let i = 0; i < deck.length; i++) {
    const j = (random() * deck.length) | 0
    const t = deck[i]
    deck[i] = deck[j]
    deck[j] = t
  }
}

function playCard(
  state: State,
  actor: Player,
  { card, quality }: { card: Card; quality: number },
): State {
  const { trick, players } = state
  const { suit, cards } = trick
  actor.recordAction(state, card, quality)
  return {
    ...state,
    players: players.map(
      player =>
        player === actor
          ? {
              ...player,
              hand: player.hand.filter(handCard => handCard !== card),
            }
          : player,
    ) as [Player, Player, Player, Player],
    trick: {
      suit: suit === null ? card.suit : suit,
      cards: [...cards, card],
    },
    heartsBroken:
      state.heartsBroken || cardPoints(card, state.simplified) !== 0,
  }
}

function playRound(startState: State): State {
  let state = startState

  for (let i of range(4)) {
    const { players, trickLeader } = state
    const player = players[(trickLeader + i) % 4]
    const plays = validPlays(state, player.hand)
    const play = player.quality(state, plays).reduce(
      (selection, { card, quality }) => {
        if (selection === null || quality > selection.quality) {
          return { card, quality }
        } else {
          return selection
        }
      },
      null as null | { quality: number; card: Card },
    )
    if (play !== null) {
      const newState = playCard(state, player, play)
      state = newState
    } else {
      throw new Error('No play was determined')
    }
  }

  const {
    trick: { cards },
    players,
    trickLeader,
    simplified,
  } = state

  const card = trickWinner(state.trick)
  const points = trickPoints(state)

  if (card === null) {
    throw new Error('No trick winner could be determined at round end')
  }
  const cardIndex = cards.indexOf(card)
  if (cardIndex === -1) {
    throw new Error('Trick winning card was not found in trick')
  }
  const winningSeat = ((cardIndex + 4 - trickLeader) % 4) as 0 | 1 | 2 | 3
  const winningPlayer = players[winningSeat]
  if (winningPlayer === undefined) {
    throw new Error(
      'No player could be associated with the card that won the trick',
    )
  }

  players.forEach(player => {
    if (points !== 0 && player === winningPlayer) {
      player.assignReward(-points)
    } else {
      // Assign the bonus of expected points per turn
      // if the agent collected no points
      player.assignReward(simplified ? 0.25 : 0.5)
    }
  })

  return {
    ...state,
    trickLeader: winningSeat,
    trick: {
      suit: null,
      cards: [],
    },
    players: players.map(player => {
      if (points !== 0 && player === winningPlayer) {
        return {
          ...player,
          score: player.score + points,
        }
      } else {
        return player
      }
    }) as [Player, Player, Player, Player],
  }
}

export function playGame(
  policies: [Quality, Quality, Quality, Quality],
  simplified: boolean,
  random: () => number = Math.random,
) {
  const deck = [...freshDeck()]
  shuffleDeck(deck, random)

  const players: Player[] = policies.map((policy, seat) =>
    createPlayer(policy, deck.slice(seat * 13, (1 + seat) * 13)),
  )

  const startingPlayer = playerWithCard(players, 'clubs', 2)
  if (startingPlayer === null) {
    throw new Error(
      'The two of clubs was not dealt, so no start player can be determined',
    )
  }

  const startingSeat = players.indexOf(startingPlayer) as -1 | 0 | 1 | 2 | 3
  if (startingSeat === -1) {
    throw new Error(
      'No player matched the one found to have the two of clubs, so no start player could be determined ',
    )
  }

  let state: State = {
    players: players as [Player, Player, Player, Player],
    trick: { suit: null, cards: [] },
    simplified,
    heartsBroken: false,
    trickLeader: startingSeat,
  }

  for (let i of range(13)) {
    state = playRound(state)
  }

  return players.map(player => {
    player.assignReward(((simplified ? 3.25 : 6.5) - player.score) * 2)
    return player.terminate()
  })
}
