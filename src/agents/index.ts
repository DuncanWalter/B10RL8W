import { Policy } from '../simulator/player'
import { FeedBack } from './history'

export type Agent<F = any> = {
  policy: Policy<F>
  train: (feedBack: FeedBack<F>[]) => void
}

export { createContextlessAgent } from './contextless'
export { createRandomAgent } from './random'
