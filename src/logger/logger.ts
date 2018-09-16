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

function updateValid(newLog: LogData, update: LogUpdate) {
  return (
    newLog.agentType == update.agentType &&
    newLog.simplified == update.simplified &&
    newLog.suitCount == update.suitCount &&
    newLog.sessionName == update.sessionName
  )
}

const validFileNameChars = /[a-zA-Z0-9\_]/

async function listLogs() {
  await fs.ensureDir(path.join(pwd, '.logs'))
  const logPromises = (await fs.readdir(path.join(pwd, '.logs/')))
    .filter(file => file.slice(-5) === '.json')
    .map(async file => retrieveHeader((await fs.readJson(file)) as LogData))

  return Promise.all(logPromises).then(results =>
    JSON.stringify({ logs: results } as GETLogsResponse),
  )
}

async function grabLog(request: LogRequest) {
  await fs.ensureDir(path.join(pwd, '.logs'))
  const fileName = sanitizeSessionName(request.sessionName)
  return JSON.stringify((await fs.readJson(
    path.join(pwd, '.logs/', `${fileName}.json`),
  )) as GETLogResponse)
}

async function updateLog(update: LogUpdate) {
  await fs.ensureDir(path.join(pwd, '.logs'))
  const fileName = sanitizeSessionName(update.sessionName)
  const filePath = path.join(pwd, '.logs', `${fileName}.json`)
  const existingFilePaths = await fs.readdir(path.join(pwd, '.logs/'))
  let newLog: LogData
  const doUpdate = existingFilePaths.includes(filePath)
  const currentTime = Date.now()
  if (doUpdate) {
    const logContent = (await fs.readJson(filePath)) as LogData
    try {
      newLog = {
        ...logContent,
        gamesPlayed: logContent.gamesPlayed + update.additionalGamesPlayed,
        qualityWeights: update.newQualityWeights,
        lastUpdate: currentTime,
      }
    } catch {
      throw new Error(`Log file ${fileName}.json is malformed`)
    }
    if (!updateValid) {
      throw new Error(`Log file ${fileName}.json did not match request`)
    }
  } else {
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

  return fs.writeJSON(filePath, newLog).then(() =>
    JSON.stringify({
      message: doUpdate
        ? `Successfully updated ${update.sessionName}`
        : `Successfully created ${update.sessionName}`,
    } as POSTLogResponse),
  )
}

async function deleteLog(request: LogRequest) {
  await fs.ensureDir(path.join(pwd, '.logs'))
  const fileName = sanitizeSessionName(request.sessionName)
  return fs.remove(path.join(pwd, '.logs/', `${fileName}.json`)).then(() =>
    JSON.stringify({
      message: `Successfully deleted file ${request.sessionName}`,
    } as DELETELogResponse),
  )
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

async function requestLogs(ctx: Koa.Context) {
  try {
    ctx.response.body = await listLogs()
    ctx.response.status = 200
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
    ctx.response.body = await grabLog(request)
    ctx.response.status = 200
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
    ctx.response.body = await updateLog(request)
    ctx.response.status = 200
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
    ctx.response.body = await deleteLog(request)
    ctx.response.status = 200
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

app.use(route.get('/logs', async ctx => processRequest(ctx, requestLogs)))
app.use(route.get('/log', async ctx => processRequest(ctx, requestLog)))
app.use(route.post('/log', async ctx => processRequest(ctx, requestLogUpdate)))
app.use(
  route.delete('/log', async ctx => processRequest(ctx, requestLogDelete)),
)
console.log('Making server')
app.use(ctx => {
  ctx.status = 418
  console.log('here')
  ctx.body = JSON.stringify({
    error: 'This is not the endpoint you are looking for',
  })
})
