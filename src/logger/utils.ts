import * as Stream from 'stream'

export function unwrapStream(stream: Stream) {
  return new Promise<any>((resolve, reject) => {
    const data: string[] = []
    stream.on('data', chunk => {
      if (chunk instanceof Buffer) {
        data.push(chunk.toString('utf8'))
      } else {
        data.push(chunk)
      }
    })
    stream.once('end', () => {
      const allData = data.join()
      if (allData === '') {
        resolve(undefined)
      } else {
        resolve(JSON.parse(allData))
      }
    })
    stream.on('error', err => reject(err))
  })
}
