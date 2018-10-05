import { Agent, FeedBack } from '.'
import { Player, State, Card } from '../simulator'
import {
  joinSummaries,
  handSummary,
  trickSummary,
  actionSummary,
} from './gameSummary'

export const ruleTrackingSummary = joinSummaries(
  handSummary,
  trickSummary,
  actionSummary,
)
