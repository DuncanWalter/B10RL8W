import {
  createAgent,
  contextlessSummary,
  ruleTrackingSummary,
  cardCountingSummary,
  cardSharkSummary,
} from './createAgents'
import { trainAgent } from './training'
;[
  contextlessSummary,
  ruleTrackingSummary,
  cardCountingSummary,
  cardSharkSummary,
].forEach(summary => {
  test(`Running ${summary} agents works`, () => {
    trainAgent(createAgent(summary), 2, true, (epoch, mean, stdDev) => {
      if (epoch % 40 === 39) {
        // console.log(
        //   `epoch ${epoch + 1}: \tmean ${mean | 0} \tstdDev ${stdDev | 0}`,
        // )
      }
    })
  })
})
