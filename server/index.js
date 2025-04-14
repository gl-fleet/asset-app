/** Server configuration **/
require('dotenv').config()

for (const x in process.env) {
    let v = process.env[x], s = ''
    if (x.toLowerCase().indexOf('password') >= 0) for (let i = 0; i < v.length; i++) s += i % 2 === 0 ? '*' : v[i]
    else s = v
    console.log(`${x} -> ${s}`)
}

const cors = require('cors')
const path = require("path")
const http = require('http')
const express = require("express")

const { Server } = require("socket.io")
const { eventAc } = require("./ac2000")

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '50mb' }))
const server = http.createServer(app)
const port = Number(process.env.PORT ?? 80)
server.setTimeout(15000)

app.get(`/app/health`, (req, res) => res.status(200).json({
    pid: process.pid,
    uptime: process.uptime(),
}))

const io = new Server(server, {
    transports: ['websocket', 'polling'],
    path: `/app/socket.io/`,
    maxHttpBufferSize: 1024 * 4, /** 4kb **/
})

/** Listening to AC2000 **
    eventAc.emit('start')
    eventAc.on('data', ({ device, hotstamp }) => { console.log(`[AC2000]: ${device} ${hotstamp}`) })
*/

io.on('connection', (socket) => { /* console.log(`New connection from ${socket.handshake.address} [${socket.id}]`) */ })

app.disable("x-powered-by")

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

require('./utils').generateENV()

app.use(require('./ims').useIMS)
app.use(require('./minlog').useMinlog)

app.use(express.static(path.join(__dirname, "..", "build")))
app.use((req, res, next) => res.sendFile(path.join(__dirname, "..", "build", "index.html")))

server.listen(port, '0.0.0.0', () => { console.log(`Server started on port ${port}`) })