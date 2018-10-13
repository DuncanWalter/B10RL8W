import { Agent, interpretHistory } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'
import '../utils/arrayGenerate'
import { createHeuristicAgent, heuristicAgent } from './heuristic'

export function trainAgent<F>(
  { policy: agent, train }: Agent<F>,
  epochs: number,
  simplified: boolean,
  log: (epoch: number, meanLoss: number, stdDevLoss: number) => void = () => {},
  done: (cancelled: boolean) => void = () => {},
) {
  let cancelled = false
  function cancel() {
    cancelled = true
  }
  const hugo = heuristicAgent.policy
  function trainEpoch(epoch: number) {
    const { meanLoss, stdDevLoss } = train(
      [...range(6)].generate(() => {
        const [a, _, b] = playGame([agent, hugo, agent, hugo], simplified)
        return [a, b].map(interpretHistory).generate(({ feedBack }) => feedBack)
      }),
    )
    log(epoch, meanLoss, stdDevLoss)
    if (!cancelled && epoch < epochs) {
      setTimeout(trainEpoch, 0, epoch + 1)
    } else {
      done(cancelled)
    }
  }
  setTimeout(trainEpoch, 0, 1)
  return cancel
}
