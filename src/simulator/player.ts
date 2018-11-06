import { Card, State } from '.'

/** A Player consist of a particular (possibly partially empty) hand, the number
 * of points that agent has taken, and a policy (map from state and actions to a
 * particular action and quality of that action)
 */

export type ActionSummary<F = any> = {
  action: Card
  quality: number
  trace: F
}

export type Policy<F = any> = (
  globalState: State,
  agentState: Player<F>,
  actions: Card[],
) => ActionSummary<F>[]

export type History<F = any> =
  | {
      reward: number
      state: State
      actor: Player<F>
      action: Card
      quality: number
      trace: F
      terminal?: false
    }
  | {
      reward: number
      actor: Player<F>
      terminal: true
    }

export type Player<F = any> = {
  hand: Card[]
  score: number
  policy: Policy<F>
  playsOutOfSuit: [boolean, boolean, boolean, boolean]
  assignReward(reward: number): void
  recordAction(state: State, action: Card, quality: number, trace: F): void
  terminate(): History<F>[]
}

export function createPlayer<F>(policy: Policy<F>, hand: Card[]): Player<F> {
  let pendingReward = 0
  let history = [] as History<F>[]
  return {
    hand,
    score: 0,
    policy,
    playsOutOfSuit: [false, false, false, false],
    assignReward(reward: number) {
      pendingReward += reward
    },
    recordAction(state: State, action: Card, quality: number, trace: F) {
      history.push({
        reward: pendingReward,
        state,
        actor: this,
        action,
        quality,
        trace,
      })
      pendingReward = 0
    },
    terminate() {
      history.push({
        reward: pendingReward,
        actor: this,
        terminal: true,
      })
      pendingReward = 0
      const savedHistory = history
      history = []
      return savedHistory
    },
  }
}
