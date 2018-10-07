import {
  createAgent,
  contextlessSummary,
  ruleTrackingSummary,
  cardCountingSummary,
} from './createAgents'
import { trainAgent } from './training'
  ;[contextlessSummary, ruleTrackingSummary, cardCountingSummary].forEach(
    summary => {
      test(`Running ${summary} agents works`, () => {
        trainAgent(createAgent(summary), 10, true, (epoch, mean, stdDev) => {
          if (epoch % 40 === 39) {
            // console.log(
            //   `epoch ${epoch + 1}: \tmean ${mean | 0} \tstdDev ${stdDev | 0}`,
            // )
          }
        })
      })
    },
  )
