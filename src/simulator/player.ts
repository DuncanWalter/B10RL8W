import { Card } from './card'
import { State } from './index'

export type Quality = (
  state: State,
  actions: Card[],
) => { card: Card; quality: number }[]

export type Player = {
  hand: Card[]
  score: number
  quality: Quality
  assignReward(reward: number): void
  recordAction(state: State, action: Card, quality: number): void
  terminate(): {
    reward: number
    state: State | null
    action: Card | null
    quality: number
  }[]
}

export function createPlayer(policy: Quality, hand: Card[]) {
  let pendingReward = 0
  let history = [] as {
    reward: number
    state: State | null
    action: Card | null
    quality: number
  }[]
  return {
    hand,
    score: 0,
    quality: policy,
    assignReward(reward: number) {
      pendingReward += reward
    },
    recordAction(state: State, action: Card, quality: number) {
      history.push({
        reward: pendingReward,
        state,
        action,
        quality,
      })
      pendingReward = 0
    },
    terminate() {
      history.push({
        reward: pendingReward,
        state: null,
        action: null,
        quality: 0,
      })
      pendingReward = 0
      const savedHistory = history
      history = []
      return savedHistory
    },
  }
}
