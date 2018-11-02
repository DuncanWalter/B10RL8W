import {
  Player,
  State,
  Card,
  validPlays,
  trickWinner,
  trickPoints,
  cardPoints,
} from '../simulator'
import { Agent } from '.'

/**
 * Our heuristic agent (which plays mysteriously like @dwalter
 * did before we started this project...). The heuristic works by
 * determining whether a card is "safe" to play based on whether
 * the trick is empty, the card would lead the current trick, whether
 * the trick contains points, and whether the card is worth any points.
 * With all those factors taken into account, the heuristic tries to play
 * big nasty cards when it is safe and play small, stealthy cards
 * in risky situations.
 */
export function createHeuristicAgent(): Agent<null> {
  return {
    policy(state: State, player: Player, actions: Card[]) {
      const possibleMoves = validPlays(state, player.hand)
      const currentPoints = trickPoints(state.trick, state.simplified)
      const goodMoves = possibleMoves.filter(card => {
        const leadsTrick =
          card ===
          trickWinner({
            suit: state.trick.suit,
            cards: [card, ...state.trick.cards],
          })
        const additionalPoints = cardPoints(card, state.simplified)
        const projectedPoints = currentPoints + additionalPoints
        const safePlay = !(leadsTrick && projectedPoints > 0)
        return safePlay && state.trick.cards.length !== 0
      })

      return actions.map(action => {
        if (goodMoves.includes(action)) {
          return {
            action,
            quality: action.rank + 2 * cardPoints(action, state.simplified),
            trace: null,
          }
        } else {
          return {
            action,
            quality: -action.rank,
            trace: null,
          }
        }
      })
    },
    train(feedBack: unknown) {
      return {
        meanLoss: NaN,
        stdDevLoss: NaN,
      }
    },
    serialize() {
      return 'null'
    },
  }
}

export const heuristicAgent = createHeuristicAgent()
