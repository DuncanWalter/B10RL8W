import { Agent, interpretHistory, FeedBack } from '.'
import { playGame, Policy } from '../simulator'
import { range } from '../utils/range'

export function evaluateAgent<F, G>(
  { policy: testPolicy }: Agent<F, any>,
  { policy: baselinePolicy }: Agent<G, any>,
  numTrials: number,
  simplified: boolean,
  log: (totalScore: number, numScores: number) => void,
) {
  const indicesCombinations = [[0], [0, 1], [0, 2], [0, 1, 2]]
  let totalScore = 0
  let numScores = 0
  for (let _ of range(numTrials)) {
    ;({ totalScore, numScores } = indicesCombinations
      .map(indices =>
        playEvaluatingGame(indices, testPolicy, baselinePolicy, simplified),
      )
      .reduce(
        (
          { totalScore: previousTotal, numScores: previousNum },
          { totalScore: newTotal, numScores: newNum },
        ) => ({
          totalScore: previousTotal + newTotal,
          numScores: previousNum + newNum,
        }),
        { totalScore, numScores },
      ))
  }
  log(totalScore, numScores)
}

function playEvaluatingGame<F, G>(
  indices: number[],
  testPolicy: Policy<F>,
  baselinePolicy: Policy<G>,
  simplified: boolean,
) {
  return {
    totalScore: playGame<F | G, F | G, F | G, F | G>(
      [0, 1, 2, 3].map(
        i => (indices.includes(i) ? testPolicy : baselinePolicy),
      ) as [Policy<F | G>, Policy<F | G>, Policy<F | G>, Policy<F | G>],
      simplified,
    )
      .filter((_, i) => indices.includes(i))
      .map(interpretHistory)
      .reduce((acc, { score }) => (acc += score), 0),
    numScores: indices.length,
  }
}
