import {
  createAgent,
  contextlessSummary,
  ruleTrackingSummary,
  cardCountingSummary,
  cardSharkSummary,
} from './createAgents'
import { trainAgent } from './training'
import { evaluateAgents } from './evaluating'
import { createRandomAgent } from './random'

test(`Contextless agents can be trained`, done => {
  const timmy = createAgent(contextlessSummary)
  let m = 0
  let s = 0
  let g = 100
  trainAgent(
    timmy,
    2,
    true,
    (epoch, mean, stdDev) => {
      m += mean
      s += stdDev
      if (epoch % g === g - 1) {
        // console.log(
        //   `epoch ${epoch + 1}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
        // console.log(evaluateAgents([timmy, createRandomAgent()], 500, false))
      }
    },
    done,
  )
})

test(`Rule Tracking agents can be trained`, done => {
  const regina = createAgent(ruleTrackingSummary)
  let m = 0
  let s = 0
  let g = 100
  trainAgent(
    regina,
    2,
    true,
    (epoch, mean, stdDev) => {
      m += mean
      s += stdDev
      if (epoch % g === g - 1) {
        // console.log(
        //   `epoch ${epoch + 1}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
        // console.log(evaluateAgents([regina, createRandomAgent()], 500, false))
      }
    },
    done,
  )
})

test(`Card Counting agents can be trained`, done => {
  const dracula = createAgent(cardCountingSummary)
  let m = 0
  let s = 0
  let g = 100
  trainAgent(
    dracula,
    2,
    true,
    (epoch, mean, stdDev) => {
      m += mean
      s += stdDev
      if (epoch % g === g - 1) {
        // console.log(
        //   `epoch ${epoch + 1}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
        // console.log(evaluateAgents([dracula, createRandomAgent()], 500, false))
      }
    },
    done,
  )
})

test(`Card Shark agents can be trained`, done => {
  const james = createAgent(cardSharkSummary)
  let m = 0
  let s = 0
  let g = 100
  trainAgent(
    james,
    2,
    true,
    (epoch, mean, stdDev) => {
      m += mean
      s += stdDev
      if (epoch % g === g - 1) {
        // console.log(
        //   `epoch ${epoch + 1}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
        // console.log(evaluateAgents([james, createRandomAgent()], 500, false))
      }
    },
    done,
  )
})
