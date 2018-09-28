import { createContextlessAgent } from './contextless'
import { trainAgent } from './training'

test('Running random agents works', () => {
  trainAgent(createContextlessAgent(), 10, true, (epoch, mean, stdDev) => {
    // if (epoch % 40 === 39) {
    //   console.log(
    //     `epoch ${epoch + 1}: \tmean ${mean | 0} \tstdDev ${stdDev | 0}`,
    //   )
    // }
  })
})
