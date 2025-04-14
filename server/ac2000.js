const net = require("net")
const EventEmitter = require('events')
const eventAc = new EventEmitter()
const env = process.env
const alias = `AC2000`
const log = console

const parser = (data) => {

    try {

        const arr = data.split('|')
        if (arr[0] == 'TRDS') return { hotstamp: arr[1], device: arr[arr.length - 3] }
        return null

    } catch ({ message }) {

        log.error(`${alias}: while splitting AC2000 socket data: ${message}`)
        return null

    }

}

eventAc.once('start', () => {

    try {

        const client = new net.Socket()
        const config = { timeout: 5000, reconnect: 5000, dead: true }

        client.setKeepAlive(true, config.timeout)
        client.setMaxListeners(5) /** Only 5 listeners: [ connect, data, error, close, end ] */
        client.setTimeout(config.timeout)

        const getConnection = () => client.connect(env.TCP_PORT, env.TCP_URL)

        client.on('connect', () => {

            eventAc.emit('status', 'Connected')
            log.info(`${alias}: Connected to ${env.TCP_URL}`)
            config.dead = false

        })

        client.on('data', (data) => {

            console.log(data.toString())
            const parsed = parser((data).toString())
            if (parsed) { eventAc.emit('data', parsed) }

        })

        client.on('error', (err) => {

            eventAc.emit('status', `Connection error: ${env.TCP_URL}`)
            log.error(`${alias} Connection error: ${env.TCP_URL}`)
            config.dead = true

        })

        client.on('close', () => {

            eventAc.emit('status', `Connection closed: ${env.TCP_URL}`)
            log.error(`${alias} Connection closed: ${env.TCP_URL}`)
            config.dead = true

        })

        client.on('end', () => {

            eventAc.emit('status', `Connection end: ${env.TCP_URL}`)
            log.error(`${alias} Connection end: ${env.TCP_URL}`)
            config.dead = true

        })

        setInterval(() => {

            if (config.dead) {

                client.destroy()
                log.error(`${alias} Connecting... [ ClientDestroyed: ${client.destroyed} ]`)
                client.destroyed && getConnection()

            }

        }, config.reconnect)

    } catch ({ message }) { log.error(`${alias}: Critical / ${message}`) }

})

exports.eventAc = eventAc