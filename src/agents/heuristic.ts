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

export function createHeuristicAgent(
  simplified: boolean,
): Agent<null, 'heuristic'> {
  return {
    type: 'heuristic',
    policy(state: State, player: Player, actions: Card[]) {
      const possibleMoves = validPlays(state, player.hand)
      const possiblePoints = trickPoints(state.trick, simplified)
      const winningMoves = possibleMoves.filter(card => {
        return (
          card ===
          trickWinner({
            suit: state.trick.suit,
            cards: [card, ...state.trick.cards],
          })
        )
      })
      const losingMoves = possibleMoves.filter(card => {
        return (
          card !==
          trickWinner({
            suit: state.trick.suit,
            cards: [card, ...state.trick.cards],
          })
        )
      })

      const goodMoves = [
        ...winningMoves.filter(card => {
          return possiblePoints + cardPoints(card, simplified) === 0
        }),
        ...losingMoves,
      ]

      return actions.map(action => {
        if (goodMoves.includes(action)) {
          return {
            action,
            quality: action.rank + 2 * cardPoints(action, simplified),
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
