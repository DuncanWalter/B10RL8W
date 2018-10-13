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

export function createHeuristicAgent(): Agent<null, 'heuristic'> {
  return {
    type: 'heuristic',
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
