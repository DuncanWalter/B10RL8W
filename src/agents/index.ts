import { Policy } from '../simulator/player'
import { FeedBack } from './history'

/**
 * Agents are a behavior within the environment / simulation
 * which are capable of expressing opinions on taking different actions.
 * Agents can also be given feedback (the results of their actions) which
 * the agent can use however it sees fit under the hood. Finally, agents can
 * be serialized for saving and loading purposes.
 */

export type Agent<F = unknown, T = string> = {
  policy: Policy<F>
  train: (
    feedBack: FeedBack<F>[],
  ) => {
    meanLoss: number
    stdDevLoss: number
  }
  serialize: () => string
  type: T
}

export { FeedBack, interpretHistory } from './history'

export { trainAgent } from './training'
export { evaluateAgents } from './evaluating'

export { createRandomAgent } from './random'
export { createContextlessAgent } from './contextless'
// TODO:
// export { createCardCountingAgent } from './cardCounting'
// export { createRuleTrackingAgent } from './ruleTracking'
