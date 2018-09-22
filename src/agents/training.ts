import { Agent, interpretHistory, FeedBack } from '.'
import { ANNSummary } from './contextless'
import { playGame } from '../simulator'
import { range } from '../utils/range'

export function trainAgent<F, ANNSummary>(
  { policy, train, summary }: Agent<F, ANNSummary>,
  games: number,
  simplified: boolean,
  logRateMilliseconds: number = 10000,
  log: (
    simplified: boolean,
    additionalGamesPlayed: number,
    agentSummary: ANNSummary,
  ) => void,
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
    if (i % 100 === 0 || i === games - 1) {
      timerEnd = Date.now()
      if (timerEnd - timerStart > logRateMilliseconds) {
        const additionalGamesPlayed = i - lastGameRecorded
        const agentSummary = summary()
        // TODO Implement log function in dashboard
        log(simplified, additionalGamesPlayed, agentSummary)
        lastGameRecorded = i
        timerStart = timerEnd
      }
    }
  }
}
