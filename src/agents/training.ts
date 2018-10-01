import { Agent, interpretHistory } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'
import '../utils/arrayGenerate'

export function trainAgent<F>(
  { policy, train }: Agent<F>,
  epochs: number,
  simplified: boolean,
  log: (epoch: number, meanLoss: number, stdDevLoss: number) => void,
) {
  for (let i of range(epochs)) {
    const { meanLoss, stdDevLoss } = train(
      [...range(8)].generate(() =>
        playGame([policy, policy, policy, policy], simplified)
          .map(interpretHistory)
          .generate(({ feedBack }) => feedBack),
      ),
    )
    log(i, meanLoss, stdDevLoss)
  }
}
