import { Policy } from '../simulator/player'
import { FeedBack } from './history'

export type Agent<F = any> = {
  policy: Policy<F>
  train: (feedBack: FeedBack<F>[]) => void
}

export { trainAgent } from './training'

export { createRandomAgent } from './random'
export { createContextlessAgent } from './contextless'
// TODO:
// export { createSuitCountingAgent } from './suitCounting'
// export { createCardCountingAgent } from './cardCounting'
// export { createRuleTrackingAgent } from './ruleTracking'
