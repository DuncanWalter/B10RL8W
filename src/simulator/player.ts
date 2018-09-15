import { Card } from './card'
import { State } from './index'

export type ActionSummary = {
  action: Card
  quality: number
  feedTrace: number[][]
}

export type Policy = (
  globalState: State,
  agentState: Player,
  actions: Card[],
) => ActionSummary[]

export type History = {
  reward: number
  state: State | null
  actor: Player
  action: Card | null
  quality: number
  feedTrace: number[][]
}

export type Player = {
  hand: Card[]
  score: number
  policy: Policy
  assignReward(reward: number): void
  recordAction(
    state: State,
    action: Card,
    quality: number,
    feedTrace: number[][],
  ): void
  terminate(): History[]
}

export function createPlayer(policy: Policy, hand: Card[]) {
  let pendingReward = 0
  let history = [] as History[]
  return {
    hand,
    score: 0,
    policy,
    assignReward(reward: number) {
      pendingReward += reward
    },
    recordAction(
      state: State,
      action: Card,
      quality: number,
      feedTrace: number[][],
    ) {
      history.push({
        reward: pendingReward,
        state,
        actor: this,
        action,
        quality,
        feedTrace,
      })
      pendingReward = 0
    },
    terminate() {
      history.push({
        reward: pendingReward,
        state: null,
        actor: this,
        action: null,
        quality: 0,
        feedTrace: [[]],
      })
      pendingReward = 0
      const savedHistory = history
      history = []
      return savedHistory
    },
  }
}
