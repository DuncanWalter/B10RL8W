import { Agent, interpretHistory, FeedBack } from '.'
import { playGame, Policy } from '../simulator'
import { range } from '../utils/range'

export function evaluateAgent(
  testAgent: Agent<any, any, any>,
  baselineAgent: Agent<any, any, any>,
  simplified: boolean,
  log: (
    meanScore: number,
    stdDevScore: number,
    meanPerformance: number,
    stdDevPerformance: number,
  ) => void,
  numTrials: number = 100,
) {
  const testType = testAgent.type
  const indicesCombinations = [[0], [0, 1], [0, 2], [0, 1, 2]]
  const allScores: number[] = []
  const allPerformances: number[] = []
  for (let _ of range(numTrials)) {
    const results = indicesCombinations.map(indices => {
      const agents = [0, 1, 2, 3].map(
        i => (indices.includes(i) ? testAgent : baselineAgent),
      )
      return playEvaluatingGame(agents, simplified)
    })
    results.filter(result => testType in result).forEach(result => {
      allScores.push(result[testType].score)
      allPerformances.push(result[testType].performance)
    })
  }
  const meanScore = mean(allScores)
  const meanPerformance = mean(allPerformances)
  const stdDevScore = Math.sqrt(variance(allScores, meanScore))
  const stdDevPerformance = Math.sqrt(
    variance(allPerformances, meanPerformance),
  )
  log(meanScore, stdDevScore, meanPerformance, stdDevPerformance)
}

function playEvaluatingGame(
  agents: Agent[],
  simplified: boolean,
): { [type: string]: { performance: number; score: number } } {
  const results = playGame(
    agents.map(({ policy }) => policy) as [Policy, Policy, Policy, Policy],
    simplified,
  )
    .map(interpretHistory)
    .map(({ score }, i) => ({ score, type: agents[i].type }))

  const scoresByType = results.reduce(
    (kinds, { score, type }) => {
      if (!(type in kinds)) {
        kinds[type] = []
      }
      kinds[type].push(score)
      return kinds
    },
    {} as { [prop: string]: number[] },
  )

  const performances = Object.entries(scoresByType).reduce(
    (perfMap, [type, scores]) => {
      perfMap[type] = scores.map(score =>
        Object.entries(scoresByType)
          .filter(([otherType, otherScores]) => otherType !== type)
          .reduce(
            (performance, [otherType, otherScores]) =>
              otherScores.reduce(
                (perf, otherScore) =>
                  perf +
                  (score > otherScore ? 1 : score === otherScore ? 0 : -1),
                performance,
              ),
            0,
          ),
      )
      return perfMap
    },
    {} as { [prop: string]: number[] },
  )

  return Object.keys(scoresByType).reduce(
    (resultMap, type) => {
      const avgPerformance =
        performances[type].reduce((sum, next) => sum + next, 0) /
        performances[type].length
      const avgScore =
        scoresByType[type].reduce((sum, next) => sum + next, 0) /
        scoresByType[type].length
      resultMap[type] = { performance: avgPerformance, score: avgScore }
      return resultMap
    },
    {} as { [prop: string]: { performance: number; score: number } },
  )
}

function mean(vec: number[]) {
  let sum = 0
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i]
  }
  return sum / vec.length
}

function variance(vec: number[], _mean?: number) {
  const mu = _mean === undefined ? mean(vec) : _mean
  let sum = 0
  for (let i = 0; i < vec.length; i++) {
    const dif = vec[i] - mu
    sum += dif * dif
  }
  return sum / vec.length
}
