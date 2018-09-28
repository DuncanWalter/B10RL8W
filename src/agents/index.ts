import { Policy } from '../simulator/player'
import { FeedBack } from './history'

export type Agent<F = any> = {
  policy: Policy<F>
  train: (
    feedBack: FeedBack<F>[],
  ) => {
    meanLoss: number
    stdDevLoss: number
  }
  serialize: () => string
}

export { FeedBack, interpretHistory } from './history'

export { trainAgent } from './training'

export { createRandomAgent } from './random'
export { createContextlessAgent } from './contextless'
// TODO:
// export { createCardCountingAgent } from './cardCounting'
// export { createRuleTrackingAgent } from './ruleTracking'
