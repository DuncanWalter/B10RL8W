import { evaluateAgents } from './evaluating'
import { createRandomAgent } from './random'
import { createHeuristicAgent } from './heuristic'

test('Evaluating a random agents gives a baseline score', () => {
  let randy = createRandomAgent(2527)
  let hugo = createHeuristicAgent(false)
  const simplified = false
  const expectedScore = simplified ? 3.25 : 6.5
  const [{ meanScore: a }, { meanScore: b }] = evaluateAgents(
    [randy, hugo],
    100,
    simplified,
  )
  expect(Math.abs(a + b - 2 * expectedScore)).toBeLessThanOrEqual(0.002)
})
