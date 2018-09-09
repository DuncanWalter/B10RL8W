import { app } from './logger'
import { unwrapStream } from './logger'
import * as http from 'http'

const port = 8378
app.listen(port)

let requestOptions = (path: string) => ({
  hostname: '127.0.0.1',
  port: port,
  path: path,
})

test('A Get request to "logs" will return a list of log files', async () => {
  const req = http.request(requestOptions('/logs'))
  req.end()
  const resPromise = new Promise(resolve => {
    req.once('response', res => {
      resolve(unwrapStream(res))
    })
  })
  console.log(resPromise)
  console.log(await resPromise)
  expect(typeof (await resPromise)).toBe('string')
})
