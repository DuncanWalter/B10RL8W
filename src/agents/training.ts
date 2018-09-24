import { Agent, interpretHistory, FeedBack } from '.'
import { ANNSummary } from './contextless'
import { playGame } from '../simulator'
import '../utils/arrayGenerate'

const results: number[][] = []

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
  let snapshots: { gameNumber: number; meanError: number[] }[] = []
  for (let i = 0; i < games; i++) {
    const gameOutcomes = playGame(
      [policy, policy, policy, policy],
      simplified,
    ).map(interpretHistory)

    const meanError = [
      ...gameOutcomes.generate(function*({ feedBack }) {
        yield* feedBack
      }),
    ].map(
      ({ expected, actual }) => /*0.5 **/ Math.abs(expected - actual) /** 2*/,
    )
    // .reduce((a, b) => a + b, 0) / 52

    snapshots.push({
      gameNumber: i + 1,
      meanError,
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
    if (i % 200 === 199 || i === games - 1) {
      timerEnd = Date.now()
      results.push([
        ...snapshots
          .reduce<number[]>((acc, s) => acc.concat(s.meanError), [] as number[])
          .map(num => num.toFixed(0))
          .reduce<Map<string, number>>((map, err) => {
            map.set(err, map.get(err) ? map.get(err)! + 1 : 1)
            return map
          }, new Map()),
      ].sort(([a], [b]) => -b - -a) as any)
      snapshots = []
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
  // console.log(results)
}
