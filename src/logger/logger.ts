import * as Koa from 'koa'
import * as route from 'koa-route'
import * as fs from 'fs'
import * as http from 'http'
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

type logData = {
  agentType:
    | 'contextless'
    | 'suit-counting'
    | 'card-counting'
    | 'context-learning'
  simplified: boolean
  gamesPlayed: number
  suitCount: number
  // Used to identify a log
  sessionName: string
  creationTime: number
  lastUpdate: number
  // Net Weights, which are the only real thing we're saving
  qualityWeights: number[][][]
}

type logRequest = {
  file: string
}

// let requestBody = ()

let listLogs = () =>
  new Promise<string>(resolve => {
    fs.readdir('.logs/', (err, files) => {
      if (err || files === []) {
        resolve('There are no files to read')
      } else {
        // message += files
        let expandSimplified = (simplified: boolean) =>
          simplified ? 'simplified' : 'complete'

        let filePromises = files.map(
          file =>
            new Promise<string>(resolve => {
              fs.readFile('.logs/' + file, (err, data) => {
                if (err) {
                  console.log(`Error loading ${file}`)
                  console.log(err)
                } else {
                  const log = JSON.parse(data.toString('utf-8')) as logData
                  resolve(
                    `${file}\t${log.sessionName}\t(${
                      log.agentType
                    }, ${expandSimplified(log.simplified)})\t${log.lastUpdate}`,
                  )
                }
              })
            }),
        )
        Promise.all(filePromises).then(results => {
          resolve(results.join('\n'))
        })
      }
    })
  })

let grabLog = (file: string) =>
  new Promise<string>((resolve, reject) => {
    fs.readFile('.logs/' + file, (err, data) => {
      if (err) {
        console.log(`Error loading ${file}`)
        console.log(err)
        reject(err)
      } else {
        resolve(data.toString('utf-8'))
      }
    })
  })

app.use(
  route.get('/logs', async (ctx, next) => {
    const logsPromise = listLogs()
    next()
    ctx.response.body = JSON.stringify(await logsPromise)
  }),
)

app.use(
  route.get('/log', async (ctx, next) => {
    const request = (await unwrapStream(ctx.req)) as logRequest
    let file: string = ''
    try {
      file = request.file
    } catch {
      ctx.response.status = 400
      ctx.response.body = JSON.stringify({ error: 'no file requested' })
      return
    }
    const logPromise = grabLog(file)
    next()
    try {
      ctx.response.body = await logPromise
    } catch {
      ctx.response.status = 400
      ctx.response.body = JSON.stringify({ error: 'file not found' })
    }
  }),
)

app.use(
  route.post('/log', async (ctx, next) => {
    const newLog = unwrapStream(ctx.req)
    console.log('This was a "log" post request')
    console.log(newLog)
    next()
  }),
)

app.use(async ctx => {
  ctx.body = 'Goodnight World!'
})
