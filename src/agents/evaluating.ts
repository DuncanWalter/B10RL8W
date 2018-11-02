import { Agent, interpretHistory } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'

/**
 * Code for evaluating agents. Mostly combinatorics for determining unique seating
 * arrangements and code for collecting all the various averages and standard
 * deviations.
 */

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
        const rawPerformance = results.reduce((p, { agent: a, score: s }) => {
          return a === agent || s === score ? p : s > score ? p + 1 : p - 1
        }, 0)
        const competitors = results.reduce((c, { agent: a }) => {
          return a === agent ? c : c + 1
        }, 0)
        agentTrace.weight += 1
        agentTrace.scores.push(score)
        agentTrace.performances.push(rawPerformance / competitors)
      })
  }
  return interpretTraceCluster(traceCluster)
}

export function* allFixedContentCombinations<T>(
  options: T[],
  size: number,
): IterableIterator<T[]> {
  if (size === 0) {
    yield []
  } else if (options.length !== 0) {
    const [head, ...rest] = options
    for (let i of range(size + 1)) {
      const chain = new Array(i).fill(head)
      for (let prefix of allFixedContentCombinations(rest, size - i)) {
        yield [...prefix, ...chain]
      }
    }
  }
}

export function* allPermutations<T>(options: T[]): IterableIterator<T[]> {
  if (options.length <= 1) {
    yield options
  } else {
    const [head, ...rest] = options
    const substrings = [...allPermutations(rest)]
    for (let i of range(options.length)) {
      yield* substrings.map(substring => {
        const clone = substring.slice(0, substring.length)
        clone.splice(i, 0, head)
        return clone
      })
    }
  }
}

export function cyclicallyIndependent<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return true
  }
  const len = a.length
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      if (a[(i + j) % len] !== b[j]) {
        break
      } else if (j === len - 1) {
        return false
      }
    }
  }
  return true
}

export function allFixedContentNecklaces<T>(content: T[]): T[][] {
  const necklaces: T[][] = []
  for (let permutation of allPermutations(content)) {
    if (
      necklaces.every(necklace => cyclicallyIndependent(necklace, permutation))
    ) {
      necklaces.push(permutation)
    }
  }
  return necklaces
}

export function* allNecklaces<T>(
  options: T[],
  size: number,
): IterableIterator<T[]> {
  for (let combination of allFixedContentCombinations(options, size)) {
    yield* allFixedContentNecklaces(combination)
  }
}

const memoAllNecklaces = (function() {
  let lastOptions = [] as any
  let lastSize = -1
  let lastReturn = undefined as any
  return function<T>(options: T[], size: number): T[][] {
    if (
      options.length === lastOptions.length &&
      options.every(elem => lastOptions.includes(elem)) &&
      lastSize === size
    ) {
      return lastReturn
    }
    lastOptions = options
    lastSize = size
    lastReturn = [...allNecklaces(options, size)]
    return lastReturn
  }
})()

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

/**
 * Function which evaluates a list of agents by playing them against one another for
 * a specified number of games in all unique seating arrangements.
 */
export function evaluateAgents(
  agents: Agent<any>[],
  games: number,
  simplified: boolean,
) {
  const clusters = memoAllNecklaces(agents, 4)
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
        stdDevScore: varScore ** 0.5 / weight,
        meanPerformance: meanPerformance / weight,
        stdDevPerformance: varPerformance ** 0.5 / weight,
      }),
    )
}
