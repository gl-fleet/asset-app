const moment = require('moment')
const mssql = require('mssql')

const ls = [
    `Request from Client ->`,
    `Request for Minlog  ->`,
    `Verify WIFI-data    ->`,
]

const tans = {
    'RFID_INVALID': `No Caplamp found!`
}

const getOrGenerateRFID = (add, req) => {

    try {

        const rfid = req.query.rfid ?? 'NO_RFID_PROVIDED'
        add(`${ls[0]} ${rfid}`)
        return rfid

    } catch (err) {

        const rfid = 'NO_RFID_RECEIVED'
        add(`${ls[0]} ${rfid}`)
        return rfid
    }

}

const callMinlogForWifiCheck = async (add, rfid) => {

    try {

        const uri = `http://minlog-assign.otapi.corp.riotinto.org/api/v1/checkWifiStatus/${rfid}`
        const raw = await fetch(uri, { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkQ2MDJEQ0UyLTk3MjUtNEZDNy1BRkI1LTNGM0FCRUY3OEE0QiIsImNsaWVudFNlY3JldCI6IjIxZTRiNzcxYzQ1OGQyNmY0NzhlOGQ3ZjNlMjIzN2Y0Y2YyYjgzNTNmNTFmOTNkMjYwYzYzODBhNTY3NmFhY2FmMmJmZDU4NzM2Mzc5YTVhMGE3M2RmNTIxMDMzNWY5NTNlZDljN2UwNWE0M2NmMTBiNzgxNzNkODVhYzlkOTQ4IiwidG9rZW5JZCI6IjdiNzZiMGJmLWIzODItNGU3ZS1iZTk1LWI4ZGEzMTExMWNiZSIsImRhdGEiOm51bGwsImlhdCI6MTY2NDc4NjYxNSwiZXhwIjo3OTQyNDc4NjYxNX0.79zgvSUNzxgtPhVncqqKIwlsvsRotCZfCfVLbAOt__o' } })
        // const raw = await fetch(uri, { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkMwMDYyRkQyLUFCNTktNDc5NC05RUE2LTRDNDkzNTMzM0M3QiIsImNsaWVudFNlY3JldCI6IjgxNWRjNzNkNjAyZWNiOGRiOGFlZTQ2Y2QxOGRkM2QwNWFiYjk0ZDljN2FiNTY4NTU3MWQ0YjMzNzQxZjNlN2EwZTdiODQxYTU5ZTk0NWFhM2I1ODZjNTZjZTM3NzZiMDQ3MTVmNDhlZjU1OWE3ZmIwZGMxNDNmY2U2OGU1M2RkIiwidG9rZW5JZCI6IjkzNmZmYmY1LTlmMGQtNGRiZC04NGE0LTNjMTc3OGRmNTAzMiIsImRhdGEiOiJ7fSIsImlhdCI6MTY2NDg2Mzc3NiwiZXhwIjozMTcyNDA4NjM3NzZ9.qK22jM7BpjUdatHtFCGqEQjquY-DSOM31jvynCwjilU' } })

        add(`${ls[1]} Parsing response ...`)

        const data = await raw.json()
        const { Data, Message, Status } = data

        add(`${ls[1]} Message received "${Message}"`)

        return {
            Data,
            Message,
            Code: Status.Code
        }

    } catch (err) {

        add(`${ls[1]} Unexpected error "${err.message}"`)

        return {
            Data: null,
            Message: `WIFI Check Request: ${err.message}`,
            Code: 500
        }

    }

}

const verifyTheWifiCheck = (add, data) => {

    try {

        let { Data, Message, Code } = data

        if (Code === 200 && (Message === 'WIFI_FOUND' || Message === 'MULE_ERROR')) {

            const { status, result, message, responseTime, detectionTime } = Data
            const minlogServerTime = moment(responseTime)
            const wifiDetectionTime = moment(detectionTime)

            add(`${ls[2]} Status ${status} / Result ${result}`)
            add(`${ls[2]} ResponseTime ${responseTime} / DetectionTime ${detectionTime}`)
            add(`${ls[2]} Message ${message}`)

            if (minlogServerTime.isValid() && wifiDetectionTime.isValid()) {

                const difference = moment.duration(minlogServerTime.diff(wifiDetectionTime))
                const minutes = difference.asMinutes()
                const fromNow = moment().add(-minutes, 'minutes').fromNow()

                Message = `Minlog system: ${fromNow}`
                Code = minutes > 15 ? 500 : 200

            } else {

                Message = `Minlog system: Invalid detection time!`
                Code = 500

            }

        } else {

            Message = `Minlog system: ${tans[Message] ?? Message}`
            Code = 500

        }

        add(`${ls[2]} ${Message}`)

        return { ...data, Code, Message }

    } catch (err) {

        add(`${ls[2]} Unexpected error "${err.message}"`)
        return { ...data, Code: 500, Message: `Unexpected error "${err.message}"` }

    }

}

exports.useMinlog = async (req, res, next) => {

    if (req.originalUrl.indexOf('/api/minlog') === 0) {

        let logs = [`    0ms: WIFI Check request`]
        const start = Date.now()
        const add = (txt) => {
            const t = `${Date.now() - start}`
            const l = ' '.repeat(5 - t.length)
            logs.push(`${l}${t}ms: ${txt}`)
        }

        const rfid = getOrGenerateRFID(add, req)
        const received = await callMinlogForWifiCheck(add, rfid)
        const verified = verifyTheWifiCheck(add, received)

        console.log(`    *** *** ***`)
        logs.forEach(t => console.log(t))

        res.end(JSON.stringify({ ...verified, Details: logs }))

    } else next()

}