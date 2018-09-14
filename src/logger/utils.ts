import * as Stream from 'stream'

type LogBase = {
  agentType:
    | 'contextless'
    | 'suit-counting'
    | 'card-counting'
    | 'context-learning'
  simplified: boolean
  suitCount: number
  sessionName: string
}
type LogDataAttributes = {
  gamesPlayed: number
  creationTime: number
  lastUpdate: number
  qualityWeights: number[][][]
}
type LogHeaderAttributes = {
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

export function unwrapStream<T>(stream: Stream): Promise<T> {
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
      if (allData === '' || allData === undefined) {
        resolve(undefined)
      } else {
        try {
          resolve(JSON.parse(allData))
        } catch (err) {
          resolve(allData)
        }
      }
    })
    stream.on('error', err => reject(err))
  })
}
