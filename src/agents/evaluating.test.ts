import { evaluateAgents } from './evaluating'
import { createRandomAgent } from './random'

test('Evaluating a random agents gives a baseline score', () => {
  let agent = createRandomAgent(2527)
  let baseline = createRandomAgent(33333)
  const simplified = false
  const expectedScore = simplified ? 3.25 : 6.5
  const [{ meanScore: a }, { meanScore: b }] = evaluateAgents(
    [agent, baseline],
    100,
    simplified,
  )
  expect(Math.abs(a + b - 2 * expectedScore)).toBeLessThanOrEqual(0.002)
})
