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
const server = app.listen(port)

const requestOptions = (path: string, method: string) => ({
  hostname: '127.0.0.1',
  port: port,
  path: path,
  method: method,
})

const testFileContents: LogData = {
  agentType: 'contextless',
  simplified: true,
  gamesPlayed: 0,
  suitCount: 4,
  sessionName: 'testie-boi',
  creationTime: 1536452406529,
  lastUpdate: 1536452406529,
  qualityWeights: [[[918]]],
}

const testFileUpdate: LogUpdate = {
  agentType: 'contextless',
  simplified: true,
  suitCount: 4,
  sessionName: 'testie-boi',
  additionalGamesPlayed: 1,
  newQualityWeights: [[[9001]]],
}

const cleanup = (done: jest.DoneCallback) => {
  server.close(done)
}

const testCreateLog = (done: jest.DoneCallback) => {
  const postLogRequest = http.request(
    requestOptions('/log', 'POST'),
    async res => {
      expect(((await unwrapStream(res)) as POSTLogResponse).message).toBe(
        `Successfully created file ${testFileContents.sessionName}`,
      )
      testGetLogs(done)
    },
  )
  postLogRequest.write(JSON.stringify(testFileContents))
  postLogRequest.end()
}

const testGetLogs = (done: jest.DoneCallback) => {
  const getLogsRequest = http.request(
    requestOptions('/logs', 'GET'),
    async res => {
      console.log(await unwrapStream(res))
      //TODO we are not getting past this await statement
      expect(((await unwrapStream(res)) as GETLogsResponse).logs).toContain({
        sessionName: 'testie-boi',
        agentType: 'contextless',
        simplified: true,
        suitCount: 4,
        gamesPlayed: 0,
        lastUpdate: 1536452406529,
      })
      console.log('Heading to U')
      testUpdateLog(done)
    },
  )
  getLogsRequest.end()
}

const testUpdateLog = (done: jest.DoneCallback) => {
  console.log('starting U')
  const updateLogRequest = http.request(
    requestOptions('/log', 'POST'),
    async res => {
      console.log('U', await unwrapStream(res))
      expect(((await unwrapStream(res)) as POSTLogResponse).message).toBe(
        `Successfully updated file ${testFileContents.sessionName}`,
      )
      testGetLog(done)
    },
  )
  updateLogRequest.write(JSON.stringify(testFileUpdate))
  updateLogRequest.end()
  console.log('We got here')
}

const testGetLog = (done: jest.DoneCallback) => {
  const getLogRequest = http.request(
    requestOptions('/log', 'GET'),
    async res => {
      const updateTime = ((await unwrapStream(res)) as GETLogResponse).log
        .lastUpdate
      expect(((await unwrapStream(res)) as GETLogResponse).log).toBe({
        agentType: 'contextless',
        simplified: true,
        gamesPlayed: 1,
        suitCount: 4,
        sessionName: 'testie-boi',
        creationTime: 1536452406529,
        lastUpdate: updateTime,
        qualityWeights: [[[9001]]],
      })
      testDeleteLog(done)
    },
  )
  getLogRequest.end()
}

const testDeleteLog = (done: jest.DoneCallback) => {
  const deleteLogRequest = http.request(
    requestOptions('/log', 'GET'),
    async res => {
      expect(((await unwrapStream(res)) as DELETELogResponse).message).toBe(
        `Successfully deleted file ${testFileContents.sessionName}`,
      )
      cleanup(done)
    },
  )
  deleteLogRequest.end()
}

test(
  'The process of creating a new log, checking its existence, updating it, ' +
    'and deleting it will occur without error',
  done => {
    // TODO
    // First we create a new log (with get log)
    // Then we check the existence of the new log (with get logs)
    // Then we update the new log (with post log)
    // Lastly, we delete the log (with delete log)

    testCreateLog(done)
  },
)
