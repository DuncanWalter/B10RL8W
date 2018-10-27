import { Agent, interpretHistory } from '.'
import { playGame, Policy } from '../simulator'
import { range } from '../utils/range'
import '../utils/arrayGenerate'
import { heuristicAgent } from './heuristic'
import { dev, max } from '../utils/math'

function forceExploration<T>(noise: number, policy: Policy<T>): Policy<T> {
  return (state, player, actions) => {
    const selections = policy(state, player, actions)
    const sigma = dev(selections.map(selection => selection.quality))
    return [
      max(selections, selection => {
        return selection.quality + noise * sigma * Math.random()
      })!,
    ]
  }
}

export function trainAgent<F>(
  { policy: agent, train }: Agent<F>,
  epochs: number,
  simplified: boolean,
  log: (epoch: number, meanLoss: number, stdDevLoss: number) => void = () => { },
  done: (cancelled: boolean) => void = () => { },
) {
  let cancelled = false
  function cancel() {
    cancelled = true
  }
  const hugo = heuristicAgent.policy
  function trainEpoch(epoch: number) {
    const { meanLoss, stdDevLoss } = train(
      [...range(30)].generate(() => {
        const [a] = playGame(
          [
            forceExploration(0.3, agent),
            hugo,
            hugo,
            hugo,
          ],
          simplified,
        )
        return [a].map(interpretHistory).generate(({ feedBack }) => feedBack)
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
