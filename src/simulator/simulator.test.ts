import { suits, card } from './card'
import { trickPoints, Trick, validPlays, trickWinner, playGame } from '.'
import { createRandomAgent } from '../agents'
import { interpretHistory, FeedBack } from '../agents/history'

test('Tricks are scored correctly', () => {
  const trick: Trick = {
    suit: null,
    cards: [card.create('clubs', 3), card.create('diamonds', 12)],
  }

  expect(trickPoints({ trick, simplified: true })).toEqual(0)
  expect(trickPoints({ trick, simplified: false })).toEqual(0)

  trick.cards.push(card.create('hearts', 5), card.create('spades', 12))

  expect(trickPoints({ trick, simplified: true })).toEqual(1)
  expect(trickPoints({ trick, simplified: false })).toEqual(14)
})

test('Trick taking cards are correctly determined', () => {
  let cards = [
    card.create('clubs', 3),
    card.create('clubs', 12),
    card.create('hearts', 5),
    card.create('spades', 12),
  ]
  expect(trickWinner({ suit: suits.clubs, cards })).toBe(cards[1])
  cards[0] = card.create('diamonds', 2)
  expect(trickWinner({ suit: suits.diamonds, cards })).toBe(cards[0])
  cards[0] = card.create('spades', 14)
  expect(trickWinner({ suit: suits.spades, cards })).toBe(cards[0])
})

test('Legal moves are correctly identified', () => {
  const hand = [
    card.create('clubs', 3),
    card.create('clubs', 12),
    card.create('hearts', 5),
    card.create('spades', 12),
  ]
  // lead off in simplified game
  expect(
    validPlays(
      {
        trick: { suit: null, cards: [] },
        simplified: true,
        heartsBroken: false,
      },
      hand,
    ).length,
  ).toEqual(4)
  // lead off with hearts broken
  expect(
    validPlays(
      {
        trick: { suit: null, cards: [] },
        simplified: false,
        heartsBroken: true,
      },
      hand,
    ).length,
  ).toEqual(4)
  // lead off restricted
  expect(
    validPlays(
      {
        trick: { suit: null, cards: [] },
        simplified: false,
        heartsBroken: false,
      },
      hand,
    ).length,
  ).toEqual(2)
  // forced to play a card
  expect(
    validPlays(
      {
        trick: { suit: suits.hearts, cards: [] },
        simplified: false,
        heartsBroken: true,
      },
      hand,
    ).length,
  ).toEqual(1)
  // forced to play a suit
  expect(
    validPlays(
      {
        trick: { suit: suits.clubs, cards: [] },
        simplified: true,
        heartsBroken: false,
      },
      hand,
    ).length,
  ).toEqual(2)
  // free to set
  expect(
    validPlays(
      {
        trick: { suit: suits.diamonds, cards: [] },
        simplified: false,
        heartsBroken: false,
      },
      hand,
    ).length,
  ).toEqual(4)
})

test('Plays a game and produces agent histories', () => {
  const { policy } = createRandomAgent(1234)
  const history = playGame([policy, policy, policy, policy], false)
  expect(history.length).toEqual(4)
})

test('Plays a game and interprets the agent histories into training data', () => {
  const { policy } = createRandomAgent(1234)
  const trainingData = playGame([policy, policy, policy, policy], false)
    .map(interpretHistory)
    .reduce(
      (acc, { feedBack }) => {
        acc.push(...feedBack)
        return acc
      },
      [] as FeedBack<number>[],
    )
  expect(trainingData.length).toEqual(52)
})
