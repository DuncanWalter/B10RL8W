import * as fs from 'fs-extra'
import * as Koa from 'koa'
import * as route from 'koa-route'
import * as path from 'path'
import {
  DELETELogResponse,
  ErrorResponse,
  GETLogResponse,
  GETLogsResponse,
  POSTLogResponse,
  LogData,
  LogHeader,
  LogRequest,
  LogUpdate,
} from './types'
import { unwrapStream } from '../utils/streamUtils'

const pwd = process.env.PWD!
if (pwd === undefined) {
  throw Error(
    'Cannot determine the present working directory required for storing logs',
  )
}

export const app = new Koa()

function retrieveHeader(log: LogHeader) {
  return {
    sessionName: log.sessionName,
    agentType: log.agentType,
    simplified: log.simplified,
    suitCount: log.suitCount,
    gamesPlayed: log.gamesPlayed,
    lastUpdate: log.lastUpdate,
  } as LogHeader
}

function sanitizeSessionName(sessionName: string) {
  return sessionName
    .split('')
    .filter(ch => ch.match(validFileNameChars))
    .join('')
}

// NOTE: see below comment; was not being called
// const updateVerified = (newLog: LogData, update: LogUpdate) =>
//   newLog.agentType == update.agentType &&
//   newLog.simplified == update.simplified &&
//   newLog.suitCount == update.suitCount &&
//   newLog.sessionName == update.sessionName

const validFileNameChars = /[a-zA-Z0-9\_]/

function listLogs() {
  return new Promise<GETLogsResponse>((resolve, reject) => {
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
}

function grabLog(request: LogRequest) {
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
}

async function updateLog(update: LogUpdate) {
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

function deleteLog(request: LogRequest) {
  return new Promise<DELETELogResponse>((resolve, reject) => {
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
}

async function processRequest(
  ctx: Koa.Context,
  requestFunction: (ctx: Koa.Context) => void,
) {
  try {
    requestFunction(ctx)
  } catch (err) {
    ctx.response.body = JSON.stringify({
      error: 'Malformed request! Unable to process',
    } as ErrorResponse)
    ctx.response.status = 400
    console.error(err)
  }
}

function requestLogs(ctx: Koa.Context) {
  try {
    listLogs()
  } catch {
    ctx.response.body = JSON.stringify({
      error: 'unable to process request for log headers',
    } as ErrorResponse)
    ctx.response.status = 500
  }
}

async function requestLog(ctx: Koa.Context) {
  const request = (await unwrapStream(ctx.req)) as LogRequest
  try {
    grabLog(request)
  } catch {
    ctx.response.body = JSON.stringify({
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested'
          : `file ${request.sessionName} not found`,
    } as ErrorResponse)
    ctx.response.status = 400
  }
}

async function requestLogUpdate(ctx: Koa.Context) {
  const request = (await unwrapStream(ctx.req)) as LogUpdate
  try {
    updateLog(request)
  } catch {
    ctx.response.body = JSON.stringify({
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested for update'
          : `unable to process update for ${request.sessionName}`,
    } as ErrorResponse)
    ctx.response.status = 500
  }
}

async function requestLogDelete(ctx: Koa.Context) {
  const request = (await unwrapStream(ctx.req)) as LogRequest
  try {
    deleteLog(request)
  } catch {
    ctx.response.body = JSON.stringify({
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested for deletion'
          : `unable to process delete for ${request.sessionName}`,
    } as ErrorResponse)
    ctx.response.status = 500
  }
}

app.use(route.get('/logs', ctx => processRequest(ctx, requestLogs)))
app.use(route.get('/log', ctx => processRequest(ctx, requestLog)))
app.use(route.post('/log', ctx => processRequest(ctx, requestLogUpdate)))
app.use(route.delete('/log', ctx => processRequest(ctx, requestLogDelete)))
app.use(ctx => {
  ctx.status = 404
  ctx.body = JSON.stringify({
    error: 'This is not the endpoint you are looking for',
  })
})
