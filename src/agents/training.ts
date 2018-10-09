import { Agent, interpretHistory } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'
import '../utils/arrayGenerate'

export function trainAgent<F>(
  { policy, train }: Agent<F>,
  epochs: number,
  simplified: boolean,
  log: (epoch: number, meanLoss: number, stdDevLoss: number) => void = () => {},
  done: () => void = () => {},
) {
  let cancelled = false
  function cancel() {
    cancelled = true
  }
  function trainEpoch(epoch: number) {
    const { meanLoss, stdDevLoss } = train(
      [...range(8)].generate(() =>
        playGame([policy, policy, policy, policy], simplified)
          .map(interpretHistory)
          .generate(({ feedBack }) => feedBack),
      ),
    )
    log(epoch, meanLoss, stdDevLoss)
    if (!cancelled && epoch < epochs) {
      setImmediate(() => trainEpoch(epoch + 1))
    } else {
      done()
    }
  }
  setImmediate(() => trainEpoch(1))
  return cancel
}
