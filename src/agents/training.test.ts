import {
  createAgent,
  contextlessSummary,
  ruleTrackingSummary,
  cardCountingSummary,
  cardSharkSummary,
} from './createAgents'
import { DQNLearning, QLearning, SARSALearning } from './learningMethods'
import { trainAgent } from './training'
import { evaluateAgents } from './evaluating'
import { randomAgent } from './random'
import { heuristicAgent } from './heuristic'

jest.setTimeout(1000000000)

test(`Contextless agents can be trained`, done => {
  const timmy = createAgent(contextlessSummary, SARSALearning)
  let m = 0
  let s = 0
  let g = 100
  trainAgent(
    timmy,
    2,
    false,
    (epoch, mean, stdDev) => {
      m += mean
      s += stdDev
      if (epoch % g === 0) {
        // console.log(
        //   `epoch ${epoch}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
      }
    },
    () => {
      // console.log(
      //   evaluateAgents([timmy, randomAgent, heuristicAgent], 500, false),
      // )
      done()
    },
  )
})

test(`Rule Tracking agents can be trained`, done => {
  const regina = createAgent(ruleTrackingSummary, DQNLearning)
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
        //   `epoch ${epoch}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
      }
    },
    done,
  )
})

test(`Card Counting agents can be trained`, done => {
  const dracula = createAgent(cardCountingSummary, DQNLearning)
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
        //   `epoch ${epoch}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
      }
    },
    done,
  )
})

test(`Card Shark agents can be trained`, done => {
  const james = createAgent(cardSharkSummary, DQNLearning)
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
        //   `epoch ${epoch}: \tmean ${(((10 * m) / g) | 0) /
        //     10} \tstdDev ${(((10 * s) / g) | 0) / 10}`,
        // )
        m = 0
        s = 0
      }
    },
    done,
  )
})
