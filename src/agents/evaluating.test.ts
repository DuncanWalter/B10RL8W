import {
  evaluateAgents,
  allFixedContentCombinations,
  allFixedContentNecklaces,
  allPermutations,
  allNecklaces,
} from './evaluating'
import { createRandomAgent } from './random'
import { createHeuristicAgent } from './heuristic'

test('Combinatorics are producing expected results', () => {
  expect([...allFixedContentCombinations(['a', 'b'], 3)].length).toEqual(4)
  expect(allFixedContentNecklaces(['a', 'a', 'b', 'c']).length).toEqual(3)
  expect(allFixedContentNecklaces(['a', 'a', 'c', 'c']).length).toEqual(2)
  expect([...allPermutations(['a', 'b', 'c'])].length).toEqual(6)
  expect([...allNecklaces([1, 2, 3], 4)].length).toEqual(24)
})

test('Evaluating a random agents gives a baseline score', () => {
  let randy = createRandomAgent()
  const simplified = false
  let hugo = createHeuristicAgent(simplified)
  const expectedScore = simplified ? 3.25 : 6.5
  const [{ meanScore: a }, { meanScore: b }] = evaluateAgents(
    [randy, hugo],
    100,
    simplified,
  )
  expect(Math.abs(a + b - 2 * expectedScore)).toBeLessThanOrEqual(0.002)
})
