import * as Stream from 'stream'

type LogBase = {
  agentType:
    | 'contextless'
    | 'suit-counting'
    | 'card-counting'
    | 'context-learning'
  simplified: boolean
  gamesPlayed: number
  suitCount: number
  sessionName: string
}
type LogDataAttributes = {
  creationTime: number
  lastUpdate: number
  qualityWeights: number[][][]
}
type LogHeaderAttributes = {
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

export function unwrapStream(stream: Stream) {
  return new Promise<any>((resolve, reject) => {
    const data: string[] = []
    stream.on('data', chunk => {
      if (chunk instanceof Buffer) {
        data.push(chunk.toString('utf8'))
      } else {
        data.push(chunk)
      }
    })
    stream.once('end', () => {
      const allData = data.join()
      if (allData === '') {
        resolve(undefined)
      } else {
        resolve(JSON.parse(allData))
      }
    })
    stream.on('error', err => reject(err))
  })
}
