import { app } from './logger'
import { GETLogsResponse } from './utils'
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

const testFileContents = {
  agentType: 'contextless',
  simplified: true,
  gamesPlayed: 0,
  suitCount: 4,
  sessionName: 'testie-boi',
  creationTime: 1536452406529,
  lastUpdate: 1536452406529,
  qualityWeights: [[[918]]],
}

const cleanup = (done: jest.DoneCallback) => {
  server.close(done)
}

test('A Get request to "logs" will return a list of log files', async done => {
  // TODO
  // First we create a new log (with get log)
  // Then we check the existence of the new log (with get logs)
  // Then we update the new log (with post log)
  // Lastly, we delete the log (with delete log)
  const req = http.request(requestOptions('/logs', 'GET'), async res => {
    expect((await unwrapStream(res)) as GETLogsResponse).toHaveProperty('logs')
    cleanup(done)
  })
  req.end()
})
