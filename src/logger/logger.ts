import * as fs from 'fs-extra'
import * as Koa from 'koa'
import * as route from 'koa-route'
import * as path from 'path'
import { DELETELogResponse } from './utils'
import { ErrorResponse } from './utils'
import { GETLogResponse } from './utils'
import { GETLogsResponse } from './utils'
import { POSTLogResponse } from './utils'
import { LogData } from './utils'
import { LogHeader } from './utils'
import { LogRequest } from './utils'
import { LogUpdate } from './utils'
import { unwrapStream } from './utils'

const pwd = process.env.PWD
if (pwd === undefined) {
  throw Error(
    'Cannot determine the present working directory required for storing logs',
  )
}

export const app = new Koa()

type RejectionResponse = {
  status: number
  body: ErrorResponse
}

const retrieveHeader = (log: LogHeader) =>
  ({
    sessionName: log.sessionName,
    agentType: log.agentType,
    simplified: log.simplified,
    suitCount: log.suitCount,
    gamesPlayed: log.gamesPlayed,
    lastUpdate: log.lastUpdate,
  } as LogHeader)

const sanitizeSessionName = (sessionName: string) =>
  sessionName
    .split('')
    .filter(ch => ch.match(validFileNameChars))
    .join('')

// NOTE: see below comment; was not being called
// const updateVerified = (newLog: LogData, update: LogUpdate) =>
//   newLog.agentType == update.agentType &&
//   newLog.simplified == update.simplified &&
//   newLog.suitCount == update.suitCount &&
//   newLog.sessionName == update.sessionName

const validFileNameChars = /[a-zA-Z0-9\_]/

const listLogs = () =>
  new Promise<GETLogsResponse>((resolve, reject) => {
    fs.readdir(path.join(pwd, '.logs/'), (err, files) => {
      if (err || files === []) {
        reject('There are no files to read')
      } else {
        let filePromises = files.filter(file => file.slice(-5) === '.json').map(
          file =>
            new Promise<LogHeader>(resolve => {
              fs.readFile(path.join(pwd, '.logs/', file), (err, data) => {
                if (err) {
                  console.error(`Error loading ${file}`, err)
                } else {
                  const log = JSON.parse(data.toString('utf-8')) as LogData
                  resolve(retrieveHeader(log))
                }
              })
            }),
        )
        Promise.all(filePromises).then(results =>
          resolve({ logs: results } as GETLogsResponse),
        )
      }
    })
  })

const grabLog = (request: LogRequest) =>
  new Promise<GETLogResponse>((resolve, reject) => {
    let fileName = sanitizeSessionName(request.sessionName)
    fs.readFile(path.join(pwd, '.logs', `${fileName}.json`), (err, data) => {
      if (err) {
        console.error(`Error loading ${fileName}.json`, err)
        reject(err)
      } else {
        const log = JSON.parse(data.toString('utf-8')) as LogData
        resolve({ log } as GETLogResponse)
      }
    })
  })

const updateLog = async (update: LogUpdate) => {
  const fileName = sanitizeSessionName(update.sessionName)
  await fs.ensureDir(path.join(pwd, '.logs'))

  let newLog: LogData

  try {
    await fs.stat(path.join(pwd, '.logs', `${fileName}.json`))
    const logContent = JSON.parse(
      (await fs.readFile(path.join(pwd, '.logs', `${fileName}.json`))).toString(
        'utf8',
      ),
    )

    try {
      newLog = {
        ...logContent,
        gamesPlayed: logContent.gamesPlayed + update.additionalGamesPlayed,
        qualityWeights: update.newQualityWeights,
        lastUpdate: Date.now(),
      }
    } catch {
      throw new Error(`Log file ${fileName}.json is malformed`)
    }
  } catch {
    const currentTime = Date.now()
    newLog = {
      agentType: update.agentType,
      simplified: update.simplified,
      suitCount: update.suitCount,
      sessionName: update.sessionName,
      gamesPlayed: update.additionalGamesPlayed,
      creationTime: currentTime,
      lastUpdate: currentTime,
      qualityWeights: update.newQualityWeights,
    }
  }
  return fs.writeFile(
    path.join(pwd, '.logs', `${fileName}.json`),
    JSON.stringify(newLog),
  )
}

const deleteLog = (request: LogRequest) =>
  new Promise<DELETELogResponse>((resolve, reject) => {
    let fileName = sanitizeSessionName(request.sessionName)
    fs.unlink(path.join(pwd, '.logs', `${fileName}.json`), err => {
      if (err) {
        console.error(`Error deleting ${fileName}.json`, err)
        reject(err)
      } else {
        resolve({
          message: `Successfully deleted file ${request.sessionName}`,
        } as DELETELogResponse)
      }
    })
  })

const processRequest = async (
  ctx: Koa.Context,
  requestFunction: (request: any) => Promise<any>,
  errorHandler: (request: any) => RejectionResponse,
) => {
  const request = await unwrapStream(ctx.req)
  try {
    ctx.response.body = await requestFunction(request)
    ctx.response.status = 200
  } catch (err) {
    const { status, body } = errorHandler(request)
    ctx.response.body = body
    ctx.response.status = status
    console.error(err)
  }
}

const requestLogs = () => listLogs()
const requestLogsRejection = () =>
  ({
    status: 500,
    body: {
      error: 'unable to process request for log headers',
    } as ErrorResponse,
  } as RejectionResponse)

const requestLog = (request: LogRequest) => grabLog(request)
const requestLogRejection = (request: LogRequest) =>
  ({
    status: 400,
    body: {
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested'
          : `file ${request.sessionName} not found`,
    } as ErrorResponse,
  } as RejectionResponse)

const requestLogUpdate = (request: LogUpdate) => updateLog(request)
const requestLogUpdateRejection = (request: LogUpdate) =>
  ({
    status: 500,
    body: {
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested for update'
          : `unable to process update for ${request.sessionName}`,
    } as ErrorResponse,
  } as RejectionResponse)

const requestLogDelete = (request: LogRequest) => deleteLog(request)
const requestLogDeleteRejection = (request: LogRequest) =>
  ({
    status: 500,
    body: {
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested for deletion'
          : `unable to process delete for ${request.sessionName}`,
    } as ErrorResponse,
  } as RejectionResponse)

app.use(
  route.get('/logs', ctx =>
    processRequest(ctx, requestLogs, requestLogsRejection),
  ),
)

app.use(
  route.get('/log', ctx =>
    processRequest(ctx, requestLog, requestLogRejection),
  ),
)

app.use(
  route.post('/log', ctx =>
    processRequest(ctx, requestLogUpdate, requestLogUpdateRejection),
  ),
)

app.use(
  route.delete('/log', ctx =>
    processRequest(ctx, requestLogDelete, requestLogDeleteRejection),
  ),
)

app.use(ctx => {
  ctx.status = 404
  ctx.body = JSON.stringify({
    error: 'This is not the endpoint you are looking for',
  })
})
