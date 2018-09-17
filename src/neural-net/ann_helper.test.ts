import * as Math from 'mathjs'
import { mse } from './ann_helper'

test('test for mean squared error', () => {
  let yData = Math.matrix([[0], [1], [1], [0]])
  let output = Math.matrix([[0.123], [1.336], [0.998], [0.234]])
  expect(Math.round(mse(output, yData), 6)).toEqual(0.182785)
})
