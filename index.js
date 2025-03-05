import express from 'express'
import bootstrap from './src/app.controller.js'
import { runSocket } from './src/Modules/socketio/index.js'
const app = express()
const port = process.env.PORT || 5000

await bootstrap(app,express)
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

runSocket(server)