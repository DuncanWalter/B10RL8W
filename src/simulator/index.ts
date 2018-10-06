/**
 * Simulating Hearts is pretty straightforward. We've taken an immutable
 * state approach which allows us to cache game states for later without
 * fear of trampling our data. The more interesting part of our simulator is
 * the history collection. The game records all actions made by all players
 * along with the player's policy's (policies are taken from agent objects)
 * scratch work for choosing that action. This allows us to run the backwards
 * pass on large batches while only running the forward pass on decision
 * instances. This cuts our training time by at least a third if forward and
 * backwards passes are similarly difficult to compute.
 */

export { Card, suits, card } from './card'
export { Player, History, Policy, ActionSummary, createPlayer } from './player'
export {
  State,
  Trick,
  trickPoints,
  cardPoints,
  trickWinner,
  playGame,
  validPlays,
} from './simulator'
