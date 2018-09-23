import { Agent, interpretHistory, FeedBack } from '.'
import { ANNSummary } from './contextless'
import { playGame } from '../simulator'

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
  for (let i = 0; i < games; i++) {
    train(
      playGame([policy, policy, policy, policy], simplified)
        .map(interpretHistory)
        .reduce(
          (acc, { feedBack }) => {
            acc.push(...feedBack)
            return acc
          },
          [] as FeedBack<F>[],
        ),
    )

    if (i % 5 === 0 || i === games - 1) {
      timerEnd = Date.now()
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
