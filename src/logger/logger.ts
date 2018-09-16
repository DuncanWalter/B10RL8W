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
  const logPromises = (await fs.readdir(path.join(pwd, '.logs')))
    .filter(file => file.slice(-5) === '.json')
    .map(async file =>
      retrieveHeader((await fs.readJson(
        path.join(pwd, '.logs', file),
      )) as LogData),
    )

  return Promise.all(logPromises).then(results =>
    JSON.stringify({ logs: results } as GETLogsResponse),
  )
}

async function grabLog(session: string) {
  await fs.ensureDir(path.join(pwd, '.logs'))
  const fileName = sanitizeSessionName(session)
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
    const logContent: LogData = await fs.readJson(filePath)
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
    if (!updateValid(newLog, update)) {
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

async function deleteLog(session: string) {
  await fs.ensureDir(path.join(pwd, '.logs'))
  const fileName = sanitizeSessionName(session)
  return fs.remove(path.join(pwd, '.logs/', `${fileName}.json`)).then(() =>
    JSON.stringify({
      message: `Successfully deleted file ${session}`,
    } as DELETELogResponse),
  )
}

async function processRequest<Rest extends any[]>(
  ctx: Koa.Context,
  requestFunction: (ctx: Koa.Context, ...rest: Rest) => Promise<void>,
  ...rest: Rest
) {
  try {
    await requestFunction(ctx, ...rest)
  } catch (err) {
    ctx.response.body = JSON.stringify({
      error: 'Malformed request! Unable to process',
    } as ErrorResponse)
    ctx.response.status = 400
    console.error(err)
  }
  return ctx
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

async function requestLog(ctx: Koa.Context, session?: string) {
  if (session === undefined) {
    throw new Error('Please specify a log to request')
  }
  try {
    const body = await grabLog(session)
    ctx.response.body = body
    ctx.response.status = 200
  } catch {
    ctx.response.body = JSON.stringify({
      error:
        typeof session !== 'string'
          ? 'no file requested'
          : `file ${session}.json not found`,
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

async function requestLogDelete(ctx: Koa.Context, session: string) {
  const request = (await unwrapStream(ctx.req)) as LogRequest
  try {
    ctx.response.body = await deleteLog(session)
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

app.use(route.get('/logs', ctx => processRequest(ctx, requestLogs)))
app.use(
  route.get('/log/:session', (ctx, session) =>
    processRequest(ctx, requestLog, session),
  ),
)
app.use(route.post('/log', ctx => processRequest(ctx, requestLogUpdate)))
app.use(
  route.delete('/log/:session', (ctx, session) =>
    processRequest(ctx, requestLogDelete, session),
  ),
)
app.use(ctx => {
  ctx.status = 404
  ctx.body = JSON.stringify({
    error: 'This is not the endpoint you are looking for',
  })
})
