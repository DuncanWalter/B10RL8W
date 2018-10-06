import { createAgent, contextlessSummary } from './createAgents'
import { trainAgent } from './training'

test('Running random agents works', () => {
  trainAgent(createAgent(contextlessSummary), 10, true,
    (epoch, mean, stdDev) => {
      // if (epoch % 40 === 39) {
      //   console.log(
      //     `epoch ${epoch + 1}: \tmean ${mean | 0} \tstdDev ${stdDev | 0}`,
      //   )
      // }
    })
})
