import { Agent, interpretHistory } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'

type EvaluationTrace = {
  weight: number
  scores: number[]
  performances: number[]
}
type Evaluation = {
  weight: number
  meanScore: number
  varScore: number
  meanPerformance: number
  varPerformance: number
}
type TraceCluster = Map<Agent, EvaluationTrace>
type EvaluationCluster = Map<Agent, Evaluation>

function createTraceCluster(agents: Agent[]): TraceCluster {
  const traceCluster = new Map()
  agents.forEach(agent =>
    traceCluster.set(agent, { weight: 0, scores: [], performances: [] }),
  )
  return traceCluster
}

function interpretTraceCluster(traceCluster: TraceCluster): EvaluationCluster {
  const evalCluster = new Map()
  ;[...traceCluster].forEach(([agent, { weight, scores, performances }]) => {
    const meanScore = scores.reduce((a, b) => a + b)
    const varScore = scores.reduce(
      (a, b) => a + (b - meanScore / weight) ** 2,
      0,
    )
    const meanPerformance = performances.reduce((a, b) => a + b)
    const varPerformance = performances.reduce(
      (a, b) => a + (b - meanPerformance / weight) ** 2,
      0,
    )
    evalCluster.set(agent, {
      weight,
      meanScore,
      varScore,
      meanPerformance,
      varPerformance,
    })
  })
  return evalCluster
}

function createEvaluationCluster(
  agents: Agent[],
  weight: number,
  simplified: boolean,
): EvaluationCluster {
  const traceCluster = createTraceCluster(agents)
  for (let i of range(weight)) {
    playGame(agents.map(a => a.policy) as any, simplified)
      .map(interpretHistory)
      .map(({ score }, i) => ({ score, agent: agents[i] }))
      .forEach(({ agent, score }, _, results) => {
        const agentTrace = traceCluster.get(agent)!
        agentTrace.weight += 1
        agentTrace.scores.push(score)
        agentTrace.performances.push(
          results.reduce((p, { agent: a, score: s }) => {
            return a === agent || s === score ? p : s > score ? p - 1 : p + 1
          }, 0),
        )
      })
  }
  return interpretTraceCluster(traceCluster)
}

function allArrangements<T>(options: T[], arrangementSize: number): T[][] {
  if (options.length === 0) {
    throw new Error('Cannot arrange empty combinations')
  } else if (arrangementSize === 0) {
    return [[]]
  } else {
    return allArrangements(options, arrangementSize - 1).generate(a =>
      options.map(x => [x, ...a]),
    )
  }
}

function allSame<T>(arr: T[]) {
  if (arr.length === 0) {
    return true
  } else {
    const item = arr[0]
    for (let e of arr) {
      if (e != item) {
        return false
      }
    }
    return true
  }
}

export function evaluateAgents(
  agents: Agent<any>[],
  games: number,
  simplified: boolean,
) {
  const clusters = allArrangements(agents, 4)
    .filter(agents => !allSame(agents))
    .map((agents, _, { length }) => {
      return createEvaluationCluster(
        agents,
        Math.ceil(games / length),
        simplified,
      )
    })

  return agents
    .map(agent =>
      clusters
        .map(cluster => cluster.get(agent)!)
        .filter(x => !!x)
        .reduce<Evaluation>(
          (globalEval, clusterEval) => {
            globalEval.weight += clusterEval.weight
            globalEval.meanScore += clusterEval.meanScore
            globalEval.varScore += clusterEval.varScore
            globalEval.meanPerformance += clusterEval.meanPerformance
            globalEval.varPerformance += clusterEval.varPerformance
            return globalEval
          },
          {
            weight: 0,
            meanScore: 0,
            varScore: 0,
            meanPerformance: 0,
            varPerformance: 0,
          },
        ),
    )
    .map(
      ({ weight, meanScore, varScore, meanPerformance, varPerformance }) => ({
        meanScore: meanScore / weight,
        stdDevScore: (varScore / weight) ** 0.5,
        meanPerformance: meanPerformance / weight,
        stdDevPerformance: (varPerformance / weight) ** 0.5,
      }),
    )
}
