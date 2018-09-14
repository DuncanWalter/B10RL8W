import { app } from './logger'
import {
  GETLogsResponse,
  POSTLogResponse,
  LogData,
  LogUpdate,
  GETLogResponse,
  DELETELogResponse,
} from './utils'
import { unwrapStream } from './utils'
import * as http from 'http'

const port = 8378

function requestOptions(path: string, method: string) {
  return {
    hostname: '127.0.0.1',
    port,
    path,
    method,
  }
}

const testFileContents: LogData = {
  agentType: 'contextless',
  simplified: true,
  gamesPlayed: 1,
  suitCount: 4,
  sessionName: 'test-session',
  creationTime: 1536452406529,
  lastUpdate: 1536452406529,
  qualityWeights: [[[918]]],
}

const testFileUpdate: LogUpdate = {
  agentType: 'contextless',
  simplified: true,
  suitCount: 4,
  sessionName: 'test-session',
  additionalGamesPlayed: 1,
  newQualityWeights: [[[9001]]],
}

function testCreateLog(): Promise<void> {
  return new Promise(resolve => {
    const postLogRequest = http.request(
      requestOptions('/log', 'POST'),
      async res => {
        expect(res.statusCode).toBe(200)
        resolve()
      },
    )
    postLogRequest.write(JSON.stringify(testFileUpdate))
    postLogRequest.end()
  })
}

function testGetLogs(): Promise<void> {
  return new Promise(resolve => {
    const getLogsRequest = http.request(
      requestOptions('/logs', 'GET'),
      async res => {
        const logs = (await unwrapStream<GETLogsResponse>(res)).logs
        console.log(logs)
        const testLog = logs.find(
          ({ sessionName }) => sessionName === 'test-session',
        )
        expect(testLog).toBeTruthy()
        expect(testLog!.agentType).toBe('contextless')

        resolve()
      },
    )
    getLogsRequest.end()
  })
}

function testUpdateLog(): Promise<void> {
  return new Promise(resolve => {
    const updateLogRequest = http.request(
      requestOptions('/log', 'POST'),
      async res => {
        expect(res.statusCode).toBe(200)
        resolve()
      },
    )
    updateLogRequest.write(JSON.stringify(testFileUpdate))
    updateLogRequest.end()
  })
}

function testGetLog(): Promise<void> {
  return new Promise(resolve => {
    const getLogRequest = http.request(
      requestOptions('/log?sessionName:test-session', 'GET'),
      async res => {
        const log = (await unwrapStream<GETLogResponse>(res)).log
        expect(log).toBeTruthy()
        throw new Error('TODO:')
        resolve()
      },
    )
    getLogRequest.end()
  })
}

function testDeleteLog(): Promise<void> {
  return new Promise(resolve => {
    const deleteLogRequest = http.request(
      requestOptions('/log', 'GET'),
      async res => {
        expect(((await unwrapStream(res)) as DELETELogResponse).message).toBe(
          `Successfully deleted file ${testFileContents.sessionName}`,
        )
        resolve()
      },
    )
    deleteLogRequest.end()
  })
}

test(
  'The process of creating a new log, checking its existence, updating it, ' +
    'and deleting it will occur without error',
  async done => {
    // TODO
    // First we create a new log (with get log)
    // Then we check the existence of the new log (with get logs)
    // Then we update the new log (with post log)
    // Lastly, we delete the log (with delete log)
    const server = app.listen(port)
    try {
      await testCreateLog()
      await testGetLogs()
      await testUpdateLog()
      await testGetLog()
      await testDeleteLog()
    } finally {
      server.close(done)
    }
  },
)
