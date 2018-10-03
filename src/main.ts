import { app } from './logger/logger'
import { config } from './config'

app.listen(config.port)
console.log(`> Logger listening on port ${config.port}`)
