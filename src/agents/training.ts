import { Agent, interpretHistory, FeedBack } from '.'
import { ANNSummary } from './contextless'
import { playGame } from '../simulator'
import '../utils/arrayGenerate'
import { range } from '../utils/range'

const results: number[][] = []

function huberLoss(a: number, b: number) {
  return 0.5 * Math.min(Math.abs(a - b), 6) ** 2
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

function sum(i: number, v: (i: number) => number) {
  let sum = 0
  for (let j = 0; j < i; j++) {
    sum += v(j)
  }
  return sum
}

export function trainAgent<F>(
  { policy, train, summary }: Agent<F, ANNSummary>,
  games: number,
  simplified: boolean,
  log: (additionalGamesPlayed: number, agentSummary: ANNSummary) => void,
  logRateMilliseconds: number = 10000,
) {
  let lastGameRecorded = 0
  let timerStart = Date.now()
  let timerEnd: number
  for (let i = 0; i < games / 8; i++) {
    const gameOutcomes = [...range(8)].generate(function*() {
      yield* playGame([policy, policy, policy, policy], simplified).map(
        interpretHistory,
      )
    })

    const loss = gameOutcomes.generate(function*({ feedBack }) {
      yield feedBack.map(({ expected, actual }) => huberLoss(expected, actual))
    })

    const batchSummary = [...range(13)].map(i => {
      const data = loss.map(h => h[i])
      return {
        mean: mean(data) | 0,
        var: variance(data) | 0,
        scale: mean(data.map(x => Math.abs(x))) | 0,
      }
    })

    train(
      gameOutcomes.reduce(
        (acc, { feedBack }) => {
          acc.push(...feedBack)
          return acc
        },
        [] as FeedBack<F>[],
      ),
    )
    // console.log(
    //   [
    //     ...gameOutcomes.generate(function*({ feedBack }) {
    //       yield* feedBack
    //     }),
    //   ].map(({ expected, actual }) => expected - actual),
    // )

    // break
    if (i % 40 === 39 || i + 1 >= games / 8) {
      timerEnd = Date.now()
      console.log(batchSummary)
      if (timerEnd - timerStart > logRateMilliseconds || i === games - 1) {
        const additionalGamesPlayed = i - lastGameRecorded
        const agentSummary = summary()
        // TODO Implement log function in dashboard
        log(additionalGamesPlayed, agentSummary)

        lastGameRecorded = i
        timerStart = timerEnd
      }
    }
  }
}
