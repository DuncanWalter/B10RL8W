import * as fs from 'fs'
import * as Koa from 'koa'
import * as route from 'koa-route'
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
    .join()

const updateVerified = (newLog: LogData, update: LogUpdate) =>
  newLog.agentType == update.agentType &&
  newLog.simplified == update.simplified &&
  newLog.suitCount == update.suitCount &&
  newLog.sessionName == update.sessionName

const validFileNameChars = /[a-zA-Z0-9\_]/

const listLogs = () =>
  new Promise<GETLogsResponse>((resolve, reject) => {
    fs.readdir('.logs/', (err, files) => {
      if (err || files === []) {
        reject('There are no files to read')
      } else {
        // message += files
        const expandSimplified = (simplified: boolean) =>
          simplified ? 'simplified' : 'complete'

        let filePromises = files.filter(file => file.slice(-5) === '.json').map(
          file =>
            new Promise<LogHeader>(resolve => {
              fs.readFile('.logs/' + file, (err, data) => {
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
    fs.readFile(`.logs/${fileName}.json`, (err, data) => {
      if (err) {
        console.error(`Error loading ${fileName}.json`, err)
        reject(err)
      } else {
        const log = JSON.parse(data.toString('utf-8')) as LogData
        resolve({ log: log } as GETLogResponse)
      }
    })
  })

const updateLog = (update: LogUpdate) =>
  new Promise<POSTLogResponse>((resolve, reject) => {
    let fileName = sanitizeSessionName(update.sessionName)
    fs.readFile(`.logs/${fileName}.json`, (err, data) => {
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
          console.error(`Log file ${fileName}.json is malformed`, err)
          reject(err)
          return
        }
        if (!updateVerified) {
          const error =
            `Update request on ${fileName}.json does not match ` +
            `original log:\nLog file: ${newLog}\nUpdate: ${update}`
          console.error(error)
          reject(error)
        } else {
          fs.writeFile(
            `.logs/${fileName}.json`,
            JSON.stringify(newLog),
            err => {
              if (err) {
                console.error(`Error writing to ${fileName}.json`, err)
                reject(err)
              } else {
                resolve({
                  message: `Successfully updated file ${update.sessionName}`,
                } as POSTLogResponse)
              }
            },
          )
        }
      }
    })
  })

const deleteLog = (request: LogRequest) =>
  new Promise<DELETELogResponse>((resolve, reject) => {
    let fileName = sanitizeSessionName(request.sessionName)
    fs.unlink(`.logs/${fileName}.json`, err => {
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
  next: any,
  requestFunction: (request: any) => Promise<any>,
  errorHandler: (request: any) => RejectionResponse,
) => {
  const request = await unwrapStream(ctx.req)
  const requestPromise = requestFunction(request)
  next()
  try {
    ctx.response.body = JSON.stringify(await requestPromise)
  } catch {
    const rejection = errorHandler(request)
    ctx.response.status = rejection.status
    ctx.response.body = JSON.stringify(rejection.body)
  }
}

const requestLogs = (request: any) => listLogs()
const requestLogsRejection = (request: any) =>
  ({
    status: 500,
    body: {
      error: 'unable to process request for log headers',
    } as ErrorResponse,
  } as RejectionResponse)

const requestLog = (request: any) => grabLog(request as LogRequest)
const requestLogRejection = (request: any) =>
  ({
    status: 400,
    body: {
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested'
          : `file ${request.sessionName} not found`,
    } as ErrorResponse,
  } as RejectionResponse)

const requestLogUpdate = (request: any) => updateLog(request as LogUpdate)
const requestLogUpdateRejection = (request: any) =>
  ({
    status: 500,
    body: {
      error:
        typeof request.sessionName !== 'string'
          ? 'no file requested for update'
          : `unable to process update for ${request.sessionName}`,
    } as ErrorResponse,
  } as RejectionResponse)

const requestLogDelete = (request: any) => deleteLog(request as LogRequest)
const requestLogDeleteRejection = (request: any) =>
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
  route.get('/logs', (ctx, next) =>
    processRequest(ctx, next, requestLogs, requestLogsRejection),
  ),
)

app.use(
  route.get('/log', (ctx, next) =>
    processRequest(ctx, next, requestLog, requestLogRejection),
  ),
)

app.use(
  route.post('/log', (ctx, next) =>
    processRequest(ctx, next, requestLogUpdate, requestLogUpdateRejection),
  ),
)

app.use(
  route.delete('/log', (ctx, next) =>
    processRequest(ctx, next, requestLogDelete, requestLogDeleteRejection),
  ),
)

app.use(ctx => {
  ctx.status = 404
  ctx.body = JSON.stringify({
    error: 'This is not the request you meant to make',
  })
})
