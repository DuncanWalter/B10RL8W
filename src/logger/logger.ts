import * as fs from 'fs'
import * as Koa from 'koa'
import * as route from 'koa-route'
import * as stream from 'stream'

export const app = new Koa()

export function unwrapStream(stream: stream) {
  return new Promise<any>(resolve => {
    const data: string[] = []
    stream.on('data', chunk => {
      if (chunk instanceof Buffer) {
        data.push(chunk.toString('utf8'))
      } else {
        data.push(chunk)
      }
    })
    stream.on('end', () => {
      const allData = data.join()
      if (allData === '') {
        resolve(undefined)
      } else {
        resolve(JSON.parse(allData))
      }
    })
  })
}

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

type LogUpdateAttributes = {
  additionalGamesPlayed: number
  newQualityWeights: number[][][]
}

type LogData = LogBase & LogDataAttributes
type LogUpdate = LogBase & LogUpdateAttributes

type LogRequest = {
  sessionName: string
}

let deleteLog = (request: LogRequest) =>
  new Promise<string>((resolve, reject) => {
    let fileName = sanitizeSessionName(request.sessionName)
    fs.unlink('.logs/' + fileName, err => {
      if (err) {
        console.error(`Error deleting ${fileName}`)
        console.error(err)
        reject(err)
      } else {
        resolve(
          JSON.stringify({
            message: `Successfully deleted file ${request.sessionName}`,
          }),
        )
      }
    })
  })

let listLogs = () =>
  new Promise<string>((resolve, reject) => {
    fs.readdir('.logs/', (err, files) => {
      if (err || files === []) {
        reject('There are no files to read')
      } else {
        // message += files
        let expandSimplified = (simplified: boolean) =>
          simplified ? 'simplified' : 'complete'

        let filePromises = files.map(
          file =>
            new Promise<string>(resolve => {
              fs.readFile('.logs/' + file, (err, data) => {
                if (err) {
                  console.error(`Error loading ${file}`)
                  console.error(err)
                } else {
                  const log = JSON.parse(data.toString('utf-8')) as LogData
                  resolve(
                    `${file}\t${log.sessionName}\t(${
                      log.agentType
                    }, ${expandSimplified(log.simplified)})\t${log.lastUpdate}`,
                  )
                }
              })
            }),
        )
        Promise.all(filePromises).then(results =>
          resolve(JSON.stringify({ logs: results })),
        )
      }
    })
  })

let grabLog = (request: LogRequest) =>
  new Promise<string>((resolve, reject) => {
    let fileName = sanitizeSessionName(request.sessionName)
    fs.readFile('.logs/' + fileName, (err, data) => {
      if (err) {
        console.error(`Error loading ${fileName}`)
        console.error(err)
        reject(err)
      } else {
        resolve(data.toString('utf-8'))
      }
    })
  })

let sanitizeSessionName = (sessionName: string) =>
  sessionName
    .split('')
    .filter(ch => ch.match(/[a-zA-Z0-9\_]/))
    .join()

let updateLog = (update: LogUpdate) =>
  new Promise<string>((resolve, reject) => {
    let fileName = sanitizeSessionName(update.sessionName)
    fs.readFile('.logs/' + fileName, (err, data) => {
      if (err) {
        console.error(`Error loading ${fileName}`)
        console.error(err)
        reject(err)
      } else {
        const logData = JSON.parse(data.toString('utf-8')) as LogData
        let newLog: LogData
        try {
          newLog = {
            ...logData,
            gamesPlayed: logData.gamesPlayed + update.additionalGamesPlayed,
            qualityWeights: update.newQualityWeights,
          }
        } catch {
          console.error(`Log file ${fileName} is malformed`)
          console.error(err)
          reject(err)
          return
        }
        if (
          newLog.agentType !== update.agentType ||
          newLog.simplified !== update.simplified ||
          newLog.suitCount !== update.suitCount ||
          newLog.sessionName !== update.sessionName
        ) {
          console.error(
            `Update request on ${fileName} does not match original log`,
          )
          console.error('Log file', newLog)
          console.error('Update', update)
          reject(`Update request on ${fileName} does not match original log`)
        } else {
          fs.writeFile('.logs/' + fileName, JSON.stringify(newLog), err => {
            if (err) {
              console.error(`Error writing to ${fileName}`)
              console.error(err)
              reject(err)
            } else {
              resolve(
                JSON.stringify({
                  message: `Successfully updated file ${update.sessionName}`,
                }),
              )
            }
          })
        }
      }
    })
  })

app.use(
  route.get('/logs', async (ctx, next) => {
    const logsPromise = listLogs()
    next()
    ctx.response.body = await logsPromise
  }),
)

app.use(
  route.get('/log', async (ctx, next) => {
    const request = (await unwrapStream(ctx.req)) as LogRequest
    let cleanRequest: LogRequest
    try {
      cleanRequest = { ...request }
    } catch {
      ctx.response.status = 400
      ctx.response.body = JSON.stringify({
        error: 'malformed file retrieval request received',
      })
      return
    }
    const logPromise = grabLog(cleanRequest)
    next()
    try {
      ctx.response.body = await logPromise
    } catch {
      ctx.response.status = 400
      ctx.response.body =
        typeof cleanRequest.sessionName !== 'string'
          ? JSON.stringify({
              error: 'no file requested',
            })
          : JSON.stringify({
              error: `file ${cleanRequest.sessionName} not found`,
            })
    }
  }),
)

app.use(
  route.post('/log', async (ctx, next) => {
    const updateRequest = (await unwrapStream(ctx.req)) as LogUpdate
    let update: LogUpdate
    try {
      update = { ...updateRequest }
    } catch {
      ctx.response.status = 400
      ctx.response.body = JSON.stringify({ error: 'invalid update received' })
      return
    }
    const updatePromise = updateLog(update)
    next()
    try {
      ctx.response.body = await updatePromise
    } catch {
      ctx.response.status = 500
      ctx.response.body =
        typeof updateRequest.sessionName !== 'string'
          ? JSON.stringify({
              error: 'no file requested for update',
            })
          : JSON.stringify({
              error: `unable to process update for ${
                updateRequest.sessionName
              }`,
            })
    }
  }),
)

app.use(
  route.delete('/log', async (ctx, next) => {
    const request = (await unwrapStream(ctx.req)) as LogRequest
    let cleanRequest: LogRequest
    try {
      cleanRequest = { ...request }
    } catch {
      ctx.response.status = 400
      ctx.response.body = JSON.stringify({
        error: 'malformed file delete request received',
      })
      return
    }
    const deletePromise = deleteLog(cleanRequest)
    next()
    try {
      ctx.response.body = await deletePromise
    } catch {
      ctx.response.status = 500
      ctx.response.body =
        typeof cleanRequest.sessionName !== 'string'
          ? JSON.stringify({
              error: 'no file requested for deletion',
            })
          : JSON.stringify({
              error: `unable to process delete for ${cleanRequest.sessionName}`,
            })
    }
  }),
)

app.use(async ctx => {
  ctx.body = 'Goodnight World!'
})
