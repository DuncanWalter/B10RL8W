import * as Koa from 'koa'
import * as route from 'koa-route'

const app = new Koa()

let requestBody = (ctx: Koa.Context) =>
  new Promise<any>(resolve => {
    const data: string[] = []
    ctx.req.on('data', chunk => {
      if (chunk instanceof Buffer) {
        data.push(chunk.toString('utf8'))
      } else {
        data.push(chunk)
      }
    })
    ctx.req.on('close', () => resolve(JSON.parse(data.join())))
  })

app.use(
  route.post('/log', async (ctx, next) => {
    const newLog = requestBody(ctx)
    console.log(newLog)
    next()
  }),
)

app.use(async ctx => {
  ctx.body = 'Goodnight World!'
})

app.listen(1233)
console.log('> Logger listening on port 1233')
