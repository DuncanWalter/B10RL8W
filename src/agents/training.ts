import { Agent, interpretHistory, FeedBack } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'

export function trainAgent<F>({ policy, train }: Agent<F>, games: number) {
  for (let i of range(games)) {
    train(
      playGame([policy, policy, policy, policy], false)
        .map(interpretHistory)
        .reduce(
          (acc, { feedBack }) => {
            acc.push(...feedBack)
            return acc
          },
          [] as FeedBack<F>[],
        ),
    )
  }
}
