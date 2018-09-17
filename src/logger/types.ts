type LogBase = {
  agentType:
    | 'contextless'
    | 'suit-counting'
    | 'card-counting'
    | 'context-learning'
  simplified: boolean
  suitCount: number
}
type LogDataAttributes = {
  sessionName: string
  gamesPlayed: number
  creationTime: number
  lastUpdate: number
  qualityWeights: number[][][]
}
type LogHeaderAttributes = {
  sessionName: string
  gamesPlayed: number
  lastUpdate: number
}
type LogUpdateAttributes = {
  additionalGamesPlayed: number
  newQualityWeights: number[][][]
}

export type LogData = LogBase & LogDataAttributes
export type LogHeader = LogBase & LogHeaderAttributes
export type LogRequest = {
  sessionName: string
}
export type LogUpdate = LogBase & LogUpdateAttributes

export type DefaultResponse = {
  message: string
}
export type ErrorResponse = {
  error: string
}
export type GETLogsResponse = {
  logs: LogHeader[]
}
export type GETLogResponse = {
  log: LogData
}
export type POSTLogResponse = DefaultResponse
export type DELETELogResponse = DefaultResponse
