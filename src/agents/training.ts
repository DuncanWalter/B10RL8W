import { Agent, interpretHistory, FeedBack } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'

export function trainAgent<F, S>(
  { policy, train, summary }: Agent<F, S>,
  games: number,
  sessionName: string,
  log: (
    simplified: boolean,
    suitCount: number,
    sessionName: string,
    additionalGamesPlayed: number,
    agentSummary: S,
  ) => void,
) {
  const simplified = false
  const suitCount = 4
  let lastGameRecorded = 0
  let timerStart = Date.now()
  let timerEnd: number
  for (let i of range(games)) {
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
    if (i % 100 === 0) {
      timerEnd = Date.now()
      if (timerEnd - timerStart > 10000) {
        const additionalGamesPlayed = i - lastGameRecorded
        const agentSummary = summary()
        // TODO Implement log function in dashboard
        log(
          simplified,
          suitCount,
          sessionName,
          additionalGamesPlayed,
          agentSummary,
        )
        lastGameRecorded = i
        timerStart = timerEnd
      }
    }
  }
}
