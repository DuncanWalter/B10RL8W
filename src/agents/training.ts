import { Agent, interpretHistory } from '.'
import { playGame } from '../simulator'
import { range } from '../utils/range'
import '../utils/arrayGenerate'
import { createRandomAgent } from './random'
import { createHeuristicAgent } from './heuristic'
import { FeedBack } from './history'

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
  const randy = createRandomAgent().policy
  const hugo = createHeuristicAgent(simplified).policy
  function trainEpoch(epoch: number) {
    const { meanLoss, stdDevLoss } = train(
      [...range(4)].generate(() => {
        const [leftHist, _, rightHist] = playGame(
          [agent, randy, agent, hugo],
          simplified,
        )
        return [leftHist, rightHist]
          .map(interpretHistory)
          .generate(({ feedBack }) => feedBack)
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
