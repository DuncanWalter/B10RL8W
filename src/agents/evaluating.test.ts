import { evaluateAgent } from './evaluating'
import { createRandomAgent } from './random'

test('Evaluating a random agents against itself gives a baseline score', () => {
  let agent = createRandomAgent(2527)
  let baseline = createRandomAgent(33333)
  let averageScore: number
  const simplified = false
  const expectedScore = simplified ? 3.25 : 6.5
  evaluateAgent(
    agent,
    baseline,
    simplified,
    (meanScore, stdDevScore, meanPerformance, stdDevPerformance) => {
      expect(Math.abs(meanScore - expectedScore)).toBeLessThanOrEqual(0.2)
    },
  )
})
