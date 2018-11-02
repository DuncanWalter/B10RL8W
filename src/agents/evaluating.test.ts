import {
  evaluateAgents,
  allFixedContentCombinations,
  allFixedContentNecklaces,
  allPermutations,
  allNecklaces,
} from './evaluating'
import { createRandomAgent, randomAgent } from './random'
import { createHeuristicAgent, heuristicAgent } from './heuristic'
import { readFileSync } from 'fs'
import {
  LearningMethod,
  DQNLearning,
  QLearning,
  SARSALearning,
} from './learningMethods'
import {
  createAgent,
  contextlessSummary,
  cardGuruSummary,
  ruleTrackingSummary,
} from './createAgents'
import { GameSummary, ruleSummary } from './gameSummary'
import { Agent } from '.'

test('Combinatorics are producing expected results', () => {
  expect([...allFixedContentCombinations(['a', 'b'], 3)].length).toEqual(4)
  expect(allFixedContentNecklaces(['a', 'a', 'b', 'c']).length).toEqual(3)
  expect(allFixedContentNecklaces(['a', 'a', 'c', 'c']).length).toEqual(2)
  expect([...allPermutations(['a', 'b', 'c'])].length).toEqual(6)
  expect([...allNecklaces([1, 2, 3], 4)].length).toEqual(24)
})

test('Evaluating a random agents gives a baseline score', () => {
  let randy = createRandomAgent()
  let hugo = createHeuristicAgent()
  const simplified = false
  const expectedScore = simplified ? 3.25 : 6.5
  const [{ meanScore: a }, { meanScore: b }] = evaluateAgents(
    [randy, hugo],
    100,
    simplified,
  )
  expect(Math.abs(a + b - 2 * expectedScore)).toBeLessThanOrEqual(0.002)
})

test('Running experiments in a test suit is a terrible idea', () => {
  const agents: (
    | {
        name: string
        method: LearningMethod
        type: GameSummary<number>
        trained: true
      }
    | { trained: false; agent: Agent<any>; name: string })[] = [
    { name: 'randy', trained: false, agent: randomAgent },
    { name: 'hugo', trained: false, agent: heuristicAgent },
    {
      name: 'logs/sarsa_ruletracking_3.json',
      trained: true,
      method: SARSALearning,
      type: ruleTrackingSummary,
    },
    {
      name: 'logs/qlearningruletracking_39.json',
      trained: true,
      method: QLearning,
      type: ruleTrackingSummary,
    },
    {
      name: 'logs/dqnruletracking_12.json',
      trained: true,
      method: DQNLearning,
      type: ruleTrackingSummary,
    },
  ]
  const players = agents
    .map(agent => {
      if (agent.trained) {
        return {
          ...agent,
          ...JSON.parse(readFileSync(agent.name, 'utf8')),
        }
      } else {
        return agent
      }
    })
    .map(agent => {
      if (agent.trained) {
        return {
          name: agent.name,
          agent: createAgent(agent.type, agent.method, agent.serializedContent),
        }
      } else {
        return agent
      }
    })

  const comparisons = []

  let [head, ...rest] = players
  while (rest.length) {
    for (let player of rest) {
      const [self, other] = evaluateAgents(
        [head.agent, player.agent],
        10000,
        false,
      )
      comparisons.push({
        [head.name]: self.meanPerformance,
        [player.name]: other.meanPerformance,
      })
    }

    ;[head, ...rest] = rest
  }
  console.log(comparisons)
})
