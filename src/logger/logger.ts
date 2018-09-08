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
    stream.on('close', () => {
      //   console.log('@@@', data)
      //   console.log(data.join())
      resolve(JSON.parse(data.join()))
    })
  })
}

// let requestBody = ()

let listLogs = () =>
  new Promise<string>(resolve => {
    fs.readdir('.logs/', (err, files) => {
      let message = ''
      if (err || files === []) {
        message += 'There are no files to read'
      } else {
        message += 'There are log files:\n'
        message += files
        // TODO here you need to provide some additional information
      }
      resolve(message)
    })
  })

app.use(
  route.get('/logs', async (ctx, next) => {
    const listPromise = listLogs()
    next()
    ctx.response.body = await listPromise
  }),
)

app.use(
  route.get('/log', async (ctx, next) => {
    const newLog = await unwrapStream(ctx.req)
    console.log('This was a "log" get request')
    console.log(newLog)
    next()
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
