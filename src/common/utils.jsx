import React, { useEffect, useState, useRef } from 'react'
import { Alert, Collapse, Tag, Tooltip, Typography, Modal, Timeline } from 'antd'
import { CalendarOutlined, CaretRightOutlined } from '@ant-design/icons'
import { BroadcastChannel } from 'broadcast-channel'
import { useNavigate } from "react-router-dom"
import Draggable from 'react-draggable'
import queryString from 'query-string'
import styled from 'styled-components'
import Agent from 'agentkeepalive'
import { Dexie } from 'dexie'
import moment from 'moment'

const { Text } = Typography

const Win = typeof window === 'undefined' ? {} : window
export const Doc = typeof document === 'undefined' ? {} : document
export const isNode = typeof process === 'object'
export const dateFormat = "YYYY-MM-DD HH:mm:ss.SSS"
export const date = "YYYY-MM-DD HH:mm:ss"
export const df = "YYYY-MM-DD"
export const Loop = setInterval
export const Delay = setTimeout
export const Exec = (cb) => Delay(() => cb(), 0)
export const env = Win.env ?? {}

/**
 * @returns "YYYY-MM-DD HH:mm:ss.SSS"
 */
export const Now = () => moment().format(dateFormat)

/**
 * Parses String -> JSON
 * @param e 
 * @returns JSON
 */
export const Jfy = (e) => typeof e === 'string' ? JSON.parse(e) : e

/**
 * Parses JSON -> String
 * @param e 
 * @returns String
 */
export const Sfy = (e) => typeof e === 'string' ? e : JSON.stringify(e)

/**
 * Generates random numbers between 0 -> 100
 * Could possibly be Int or Float
 * @returns Number
 */
export const Rnd = () => Date.now() % 100

/**
 * Waits Asynchronously [ Doesn't block Event-Loop ]
 * @param ms 
 * @returns true<Boolean>
 */
export const AsyncWait = (ms) => new Promise((res) => Delay(() => res(true), ms))

/**
 * Waits Synchronously [ Blocks the Event-Loop ]
 * @param ms
 */
export const SyncWait = (ms) => {

    let start = Date.now(), now = start
    while (now - start < ms) { now = Date.now() }

}

export const iss = (s) => typeof s === 'string' && s.length > 0
export const isn = (s) => typeof s === 'number'
export const nested = (obj, ls = []) => {

    let t = obj

    if (Array.isArray(ls) && ls.length > 0) {
        for (const x of ls) {
            if (typeof t === 'object' && t.hasOwnProperty(x) && t[x]) t = t[x]
            else return null
        }
        return t
    }

    return null

}

export const toDayjs = (obj) => { }

/**
 * Sync LocalStorage 
 * @param key 
 * @param value 
 * @returns 
 */
export const KeyValue = (key, value = undefined) => {

    try {

        if (key && value !== undefined) {

            /** SET_ITEM **/
            localStorage.setItem(key, value)
            return true

        } else {

            /** GET_ITEM **/
            return localStorage.getItem(key)

        }

    } catch (error) { }

    return ''

}

export const kv = (key, value = undefined) => {

    if (typeof key === 'string') {

        if (typeof value === undefined) {
            return localStorage.getItem(key)
        }

        if (typeof value === 'string') {
            localStorage.setItem(key, value)
            return true
        }

        if (Array.isArray(value)) {
            return localStorage.getItem(key) ?? value[0]
        }

    }

    return ''

}

export const inspection_list = ['1.VisualCheck', '2.PressureTest', '3.Calibration']

/** Collection of common arguments what used in the request **/
export const commonArgs = {
    PersonnelNo: kv('PersonnelNo', ['-']),
    DepartmentId: kv('department', [1]),
}

export const persist = {

    set: (key = '', value = {}) => {

        try {

            const str = localStorage.getItem('persist')
            const jsn = str === null ? {} : JSON.parse(str)
            jsn[key] = value
            localStorage.setItem('persist', JSON.stringify(jsn))

        } catch (e) {

            console.log('Persist while setting', e.message)
            console.log('Persist while setting', key, value)
            localStorage.setItem('persist', '{}')
            return null

        }

    },

    get: (key = '') => {

        try {

            const str = localStorage.getItem('persist')
            const jsn = str === null ? {} : JSON.parse(str)
            return jsn[key]

        } catch (e) {

            console.log('Persist while getting', e.message)
            localStorage.setItem('persist', '{}')
            return null

        }

    },

}

export const isSecure = !(window.location.protocol === 'http:')
export const endpoint = env.API
export const version = env.VERSION
export const PageSize = Number(env.PAGE_SIZE ?? "15")
export const urls = {
    app_wss: env.APP.replace('https', 'wss'),
    app_ws: env.APP.replace('https', 'ws'),
    app_http: env.APP.replace('https', 'http'),
    app_https: env.APP,
    api_wss: env.API.replace('https', 'wss'),
    api_ws: env.API.replace('https', 'ws'),
    api_http: env.API.replace('https', 'http'),
    api_https: env.API,
}

export const headers = {
    // 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Authorization': `Bearer ${KeyValue('token') ?? 'none'}`,
}

/**
 * String format
 * @param {*} is 
 * @returns 
 */
export const f = (is) => {

    if (typeof is === 'string') {
        const mx = 18
        const tail = is.length > mx ? is.substring(0, mx) + '*' : is
        return <Text title={is}>{tail}</Text>
    } else return "-"

}

/**
 * Date format
 * @param {*} is 
 * @returns 
 */
export const d = (is) => {

    const dt = moment(is).format(date)
    if (dt.indexOf('00:00:00') !== -1) {

        if (typeof is === 'string') return <Tag icon={<CalendarOutlined />}>{moment(is).format(df)}</Tag>
        else return "-"

    } else {

        if (typeof is === 'string') return <Tooltip title={moment(is).format(date)}>
            <Tag icon={<CalendarOutlined />}>{moment(is).format(df)}</Tag>
        </Tooltip>

        else return "-"

    }

}

export const QueryParam = (filter = {}) => {

    try {

        if (typeof filter === 'number') return `${filter}`
        if (typeof filter === 'string') return `${filter}`

        const query = queryString.stringify(filter)
        return query ? `?${query}` : ``

    } catch (err) {
        return ``
    }

}

export const ResponseParser = (e, def = {}, meta = {}) => {

    let res = def
    meta.cd = -1
    meta.sd = -1

    if (e.hasOwnProperty('data')) {

        res = e.data.hasOwnProperty('Data') ? e.data.Data ?? def : e.data ?? def

        if (!Array.isArray(res)) {

            if (e.data.hasOwnProperty('Message')) meta.s_message = e.data.Message['$FinalResult'] ?? null
            if (e.data.hasOwnProperty('Status')) meta.s_status = e.data.Status.Success ?? null
            if (e.data.hasOwnProperty('ExecuteStart') && e.data.hasOwnProperty('ExecuteEnd')) {

                meta.ss = moment(e.data.ExecuteStart).valueOf()
                meta.se = moment(e.data.ExecuteEnd).valueOf()
                meta.sd = meta.se - meta.ss

            }

        }

    }

    return res

}

export const ErrorParser = (e, option = {}, meta = {}) => {

    const errors = [`${e.message}`]
    const keyless = option.hasOwnProperty('keyless')

    /** New payload parser **/
    if (
        e.hasOwnProperty('response') &&
        e.response.hasOwnProperty('data') &&
        (e.response.data.hasOwnProperty('Message') || e.response.data.hasOwnProperty('Errors'))
    ) {

        const ls = e.response.data['Message'] ?? e.response.data['Errors']

        if (Array.isArray(ls)) { /* demo */

            errors.push(`Array of errors [${ls.length}]`)

        } else if (typeof ls === 'object') { /* demo */

            errors.pop()
            for (const x in ls) keyless ? errors.push(`${ls[x]}`) : errors.push(`${x}: ${ls[x]}`)

        }

    }

    /** Legacy payload parser **/
    if (
        e.hasOwnProperty('response') &&
        e.response.hasOwnProperty('data')
    ) {

        const rd = e.response.data

        if (rd.hasOwnProperty('title') && rd.hasOwnProperty('status')) {
            errors.push(`${rd.title} [${rd.status}]`)
        }

        if (rd.hasOwnProperty('error')) { /* demo */
            errors.push('Error')
        }

        if (rd.hasOwnProperty('errors')) {

            for (const key in rd.errors) {

                if (Array.isArray(rd.errors[key])) {
                    keyless ? errors.push(`${rd.errors[key][0]}`) : errors.push(`${key}: ${rd.errors[key][0]}`)
                } else {
                    keyless ? errors.push(`Unknown error occured`) : errors.push(`${key}: Unknown error occured`)
                }
            }
        }

    }

    if (e.hasOwnProperty('response') && e.response.hasOwnProperty('data') && e.response.data.hasOwnProperty('Data')) {

        try {
            const { Id, AssetId } = e.response.data.Data
            errors.push({ Id, AssetId })
        } catch (err) { }
    }

    return errors

}

/**
 * Gracefully render errors
 * @param {*} error 
 * @returns 
 */
export const ErrorResponse = ({ error, extra = null }) => {

    const t = { 'Request failed with status code 401': `You are not authorized to perform this operation` }

    if (error.length > 0) {

        if (error.length >= 3) {

            const errors = []
            for (let i = 2; i < error.length; i++) errors.push(error[i])

            return <div style={{ textAlign: 'left' }}>
                <Collapse
                    size='small'
                    bordered={false}
                    expandIcon={({ isActive }) => <CaretRightOutlined style={{ color: '#faad14' }} rotate={isActive ? 90 : 0} />}
                    items={[
                        {
                            key: '0',
                            label: <span style={{ color: '#faad14' }}>{error[0]}</span>,
                            children: errors.map((err, idx) => (
                                <div key={`err_${idx}`} style={{ textAlign: 'left' }}>
                                    <Alert style={{ background: 'transparent' }} message={err} type="warning" showIcon banner closable />
                                </div>
                            ))
                        }
                    ]}
                />
                {extra}
            </div>

        } else {

            return <div style={{ textAlign: 'left' }}>
                <Alert message={t[error[0]] ?? error[0]} type="warning" showIcon banner closable />
                {extra}
            </div>

        }

    } else {

        return null

    }

}

export class Broadcast {

    alias = 'Broadcaster'
    mode = kv('iChannel', ['ChannelAPI'])
    channel = ''
    broadcast = null

    constructor(channel = 'logs', cb = null, parse = true) {

        /* console.log(`[${this.alias}:${this.mode}:${channel}] Created`) */

        this.channel = channel

        /** Using Localstorage to broadcast messages between tabs */
        if (this.mode === 'LocalStorage') {

            cb !== null && window.addEventListener("storage", (event) => {

                if (event.key === channel) {

                    try { cb(parse ? JSON.parse(event.newValue) : event.newValue) }
                    catch (err) { console.log(`[${this.alias}:${this.mode}:${channel}:on]`, err) }

                }

            })

        }

        /** Using Broadcast Channel to broadcast messages between tabs */
        if (this.mode === 'ChannelAPI') {

            this.broadcast = new BroadcastChannel(channel)

            if (cb !== null) {

                this.broadcast.onmessage = (chunk) => {

                    try { cb(parse ? JSON.parse(chunk) : chunk) }
                    catch (err) { console.log(`[${this.alias}:${this.mode}:${channel}:on]`, err) }

                }

            }

        }

    }

    emit = (data) => {

        if (this.mode === 'LocalStorage') {

            try { KeyValue(this.channel, data) }
            catch (err) { console.log(`[${this.alias}:${this.mode}:${this.channel}:emit]`, err) }

        }

        if (this.mode === 'ChannelAPI') {

            try { this.broadcast.postMessage(data) }
            catch (err) { console.log(`[${this.alias}:${this.mode}:${this.channel}:emit]`, err) }

        }

    }

}

export class Tick {

    hide = false
    ms = 0
    cb = null
    value = 0

    constructor() {

        Loop(() => {

            if (this.ms === 0 && this.hide === true) {
                this.hide = false
                this.cb && this.cb(0, this.value)
            }

            if (this.ms > 0) {
                this.hide = true
                this.cb && this.cb(this.ms, this.value)
                this.ms -= 100
            }

        }, 100)

    }

    on = (cb) => { this.cb = cb }
    can = () => this.ms === 0
    set = (ms, value) => {
        this.ms = ms
        this.value = value
    }

}

export class SmoothAllocation {

    db = {}

    tick = new Tick()

    effect = null

    constructor({ update = null, effect = null }) {

        this.tick.on(update)
        this.effect = effect

    }

    exist = (rfid) => {

        if (typeof rfid === 'string' && rfid && this.db.hasOwnProperty(rfid)) return true
        else return false

    }

    add = (item) => {

        const { AssetRfid, AssetSerial, AssetTypeName } = item

        if (this.exist(AssetRfid)) {

            if (item.status === true && item.loading === false) { /** Refetch detected **/ }
            else if (item.status && this.db[AssetRfid].status) ++this.db[AssetRfid].count

            if (item.hasOwnProperty('Id')) this.db[AssetRfid].Id = item.Id

            this.db[AssetRfid].AssetId = item.AssetId
            this.db[AssetRfid].loading = item.loading
            this.db[AssetRfid].status = item.status

        } else this.db[AssetRfid] = {
            Id: item.Id ?? Date.now(),
            AssetId: item.AssetId ?? 0,
            AssetRfid: AssetRfid,
            AssetSerial: AssetSerial,
            AssetTypeName: AssetTypeName,
            AssignedDate: item.AssignedDate ?? new Date(),
            ReturnedDate: item.ReturnedDate ?? '',
            Description: item.Description ?? '-',
            /* helper */
            loading: item.loading,
            status: item.status,
            count: 0,
            last: 0,
        }

        this.effect && this.effect(this.items())

    }

    /** Is Assigned for this person successfully? **/
    isFree = (rfid) => {

        if (this.exist(rfid)) {

            let free = this.db[rfid].status || this.db[rfid].loading ? false : true
            const last_response = Date.now() - this.db[rfid].last

            if (free && last_response < 2500) free = false

            if (!free) {

                ++this.db[rfid].count
                this.effect && this.effect(this.items())

            }

            return free

        }
        return true

    }

    /** Will trigger after GET:AssetAllocations with Status:200 **/
    items = () => {

        const items = []
        let sortable = []

        // for (const x in this.db) sortable.push([x, this.db[x].AssignedDate])
        for (const x in this.db) sortable.push([x, this.db[x].Id])
        sortable.sort((a, b) => a[1] - b[1])

        for (const x of sortable) items.push(this.db[x[0]])

        return items

    }

    loading = (rfid, indicate = true) => {

        if (this.exist(rfid)) this.db[rfid].loading = indicate
        else { /** Unexpected object **/ }

        this.effect && this.effect(this.items())

    }

    after = (rfid, state) => {

        if (this.exist(rfid)) {

            this.db[rfid].last = Date.now()

            state === 'then' && this.tick.set(300, { rfid, state })

            if (state === 'then') {
                this.db[rfid].status = true
                this.db[rfid].loading = false
            }
            if (state === 'catch') {

                this.db[rfid].status = false
                this.db[rfid].loading = false
                // this.clear(rfid)

                setTimeout(() => {

                    this.clear(rfid)

                }, 2500)

            }
            if (state === 'finally') { }

        }

    }

    clear = (rfid) => {

        if (this.exist(rfid)) {

            this.db[rfid] = undefined
            delete this.db[rfid]
            // this will pull data from server this.set(200, { rfid, state: 'then' })
            this.effect && this.effect(this.items())

        }

    }

    dispose = () => {

        this.db = {}
        this.effect && this.effect(this.items())

    }

}

export const useSerialPort = () => {

    const [open, setOpen] = useState(true)

    useEffect(() => {

        if ('serial' in navigator) console.log(`[SerialPort] The Web-Serial API is supported`)

        navigator.serial.addEventListener("connect", (e) => {
            // Connect to `e.target` or add it to a list of available ports.
            console.log(`[SerialPort:connect]`, e)
        })

        navigator.serial.addEventListener("disconnect", (e) => {
            // Remove `e.target` from the list of available ports.
            console.log(`[SerialPort:disconnect]`, e)
        })

        navigator.serial.getPorts().then((ports) => {
            // Initialize the list of available ports with `ports` on page load.
            console.log(`[SerialPort:getPorts]`, ports)
        })

    }, [])

    return [open, setOpen]

}

export const parseJwt = (token) => {

    try {

        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
        return JSON.parse(jsonPayload)

    } catch (err) { return {} }

}

export const isTokenValid = () => {

    try {

        const { iat = 0, exp = 0 } = parseJwt(kv('token', ['']))

        if (iat > 0 && exp > 0) {

            if (((exp * 1000) - Date.now()) < 0) {

                kv('token', '')
                window.location.reload()

            }

        }

    } catch (err) { }

}

export const xhr_states = (uniq = 'xhr', states = {}) => {

    const defs = {
        get: [`Get:${uniq}`, 'Fetching', 'Fetched'],
        set: [`Set:${uniq}`, 'Saving', 'Saved'],
        put: [`Put:${uniq}`, 'Updating', 'Updated'],
        del: [`Del:${uniq}`, 'Removing', 'Removed'],
        ref: [`Ref:${uniq}`, 'Refetching', 'Refetched'],
    }

    if (typeof states === 'object') for (const x in states) {

        defs[x][1] = states[x][0]
        defs[x][2] = states[x][1]
        defs[x][3] = states[x][2]
    }

    return defs

}

export const currentScreen = (screens) => {

    const asn = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
    }

    let max = 0
    for (const x in screens) if (screens[x] === true && asn[x] > max) max = asn[x]
    return max

}

export const InitialScale = () => {

    const low = document.documentElement.clientWidth < 600 ? '0.7' : '1'
    const meta = document.createElement('meta')
    meta.name = "viewport"
    meta.content = `width=device-width, user-scalable=yes, initial-scale=1.0, maximum-scale=${low}, minimum-scale=${low}`
    document.getElementsByTagName('head')[0].appendChild(meta)

}

export class BetterLog {

    obj = {}

    constructor() { }

    add = (title, index = 0, key, value) => {

        try {

            const payload = { title, index, value }
            if (this.obj.hasOwnProperty(key)) this.obj[key].push(payload)
            else this.obj[key] = [payload]

            if (index === 3) {

                const ls = key.split(':')
                const rr = this.obj[key]
                const sk = `${ls[0]}:${ls[1]}`
                const cl = this.obj[key][1].index === 1 ? '#52c41a' : '#ff4d4f'
                const c = rr[2]?.value ?? 0

                console.groupCollapsed(`%c${sk} (${c.cd}ms)`, `color: ${cl};`)

                console.log(rr[0].title, rr[0])

                console.log(rr[1].title, rr[1])

                console.log(`${rr[2].title} -> ${c.cd}ms / ${c.sd}ms / ${c.q}`)

                console.groupEnd()

                delete this.obj[key]

            }

        } catch (err) { console.log(`[BetterLog] While generating grouped-log / ${err.message}`) }

    }

}

export const StatesColorMap = {
    Active: 'success',
    Repairing: 'processing',
    Lost: 'warning',
    Broken: 'warning',
    Retired: 'error',
    Deleted: 'error',
}

/** Will tell Admin or User based on department **/
export const myAccess = (role = 'Admin') => {

    try {

        const departmentId = Number(kv('department', ['0']))
        const roles = Jfy(kv('Roles', ['[]']))

        for (const x of roles) {

            const s = x.split('-')
            // if (Number(s[0]) === departmentId && s[1] === role) return true
            if (Number(s[0]) === departmentId && Number(s[2]) < 3) return true

        }

        return false

    } catch (err) {

        console.log(`[While checking the role] ${err.message}`)
        return false

    }

}

export const access_level = () => {

    try {

        const departmentId = Number(kv('department', ['0']))
        const roles = Jfy(kv('Roles', ['[]']))

        for (const x of roles) {

            const s = x.split('-')
            if (Number(s[0]) === departmentId) return Number(s[2])

        }

        return 9

    } catch (err) {

        console.log(`[While checking the role] ${err.message}`)
        return 9

    }

}

export const department_access_list = () => {

    try {

        const roles = Jfy(kv('Roles', ['[]']))
        const obj = {}
        /* const lvl_colors = {
            1: ['blue', 'Super'],
            2: ['green', 'Admin'],
            3: ['orange', 'User'],
            4: ['grey', 'Guest'],
        } */
        for (const x of roles) {
            const [did, alias, lvl] = x.split('-')
            obj[Number(did)] = Number(lvl)
        }

        return obj

    } catch (err) {

        console.log(`[While getting the departments] ${err.message}`)
        return {}

    }

}

export const myDeps = () => {

    try {

        const roles = Jfy(kv('Roles', ['[]']))
        let deps = []

        for (const x of roles) {

            const s = x.split('-')
            deps.push(Number(s[0]))

        }

        return deps

    } catch (err) {

        console.log(`[While getting the departments] ${err.message}`)
        return []

    }

}

/** Detects whether cursor moved or not */
export const CursorDetection = (cb = null) => {

    let updates = [0, 0]
    document.addEventListener('mousemove', (e) => { updates[0] = Date.now() })

    setInterval(() => {

        if (updates[0] !== updates[1]) {

            updates[1] = updates[0]
            kv('mousemove', `${Date.now()}`)

        }

    }, 2500)

}

/** To solve conflict of serial port reader */
export const LastFocusDetection = (event) => {

    kv('last_focused_tab', `${window.id}`)

    event.on('focus', e => {
        e === true && kv('last_focused_tab', `${window.id}`)
    })

}

export const IsMasterTab = () => `${window.id}` === kv('last_focused_tab', ['---'])

export const createHttpAgent = () => {

    return new Agent({
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
    })

}

export const createHttpsAgent = () => {

    return new Agent.HttpsAgent({
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
    })

}

export const use_description = (path) => {

    try {

        const noise_canceller = (s = '', d = '|') => {

            try {

                if (typeof s !== 'string') return ''

                const u = s.split("")

                for (let i = 0; i < u.length; i++) {

                    if (u[i] === d) {

                        let fw = i, bw = i
                        while (u[++fw] === ' ') u[fw] = '^'
                        while (u[--bw] === ' ') u[bw] = '^'

                    }

                }

                return u.filter(s => s !== '^').join("")

            } catch (e) { return '' }

        }

        const vs = env['DESCRIPTION_VALUES'] ?? ''
        const cs = env['DESCRIPTION_COLORS'] ?? ''

        const vls = noise_canceller(vs).split('|')
        const cls = noise_canceller(cs).split('|')

        for (let i = 0; i < vls.length; i++) {

            const [k0, v0] = vls[i].split('=')
            const [k1, v1] = cls[i].split('=')

            const vl0 = v0.split('+'), vll0 = []
            const vl1 = v1.split('+'), vll1 = []

            vl0.forEach((e, idx) => { idx > 0 && vll0.push(e) })
            vl1.forEach((e, idx) => { idx > 0 && vll1.push(e) })

            if (path === k0 && path === k1) return {
                v: [vl0[0], vll0],
                c: [vl1[0], vll1],
            }

        }

        return null

    } catch (err) { return null }

}

export class IDB {

    ok = false
    db = null

    DepartmentId = kv('department', [1])
    PersonnelNo = kv('PersonnelNo', ['-'])
    AppVersion = kv('version', ['-'])

    constructor() {

        try {

            this.db = new Dexie('AssetAllocation_DB')
            this.db.version(1).stores({ logs: 'start, end, duration, type, version, user, department, text' })
            this.ok = true

            this.clearInterval()

        } catch (err) { console.warn(`Cannot initiate DexieJS!`) }

    }

    add = (start, end, duration, type, text) => new Promise((res, rej) => {

        /** Slow requests **/
        if (this.ok && duration > 1000) {

            this.db.logs.add({
                start: moment(start).format(dateFormat),
                end: moment(end).format(dateFormat),
                duration,
                type,
                version: this.AppVersion,
                user: this.PersonnelNo,
                department: this.DepartmentId,
                text,
            }).then(res(true)).catch(res(false))

        } else res(false)

    })

    clearInterval = () => {

        let free = true, interval = (1000 * 60) * 5, hoursToKepp = 24

        this.ok && setInterval(async () => {

            try {

                free && await this.db.logs
                    .where('start')
                    .below(moment().add(-(hoursToKepp), 'hours').format(dateFormat))
                    .delete()

            } catch (err) { } finally { free = true }

        }, interval)

    }

    download = () => {

        free && this.db.logs.each(log => {
            console.log(log)
        })

    }

}

export const Simulation = ({ geve }) => {

    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [items, setItems] = useState([])
    const [state, setState] = useState('Starting')
    const [isOnFocus, setFocus] = useState(false)

    const [disabled, setDisabled] = useState(true)
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
    const draggleRef = useRef(null)

    const Wrapper = styled.section`
        .ant-timeline-item {
            padding-bottom: 8px;
            font-size: 12px;
        }
    `

    const addTimeLine = (children, label = Now()) => setItems((e) => [...e, { label, children }])

    const onStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement
        const targetRect = draggleRef.current?.getBoundingClientRect()
        const extra = 250
        if (!targetRect) return
        setBounds({
            left: -targetRect.left + uiData.x - extra,
            right: clientWidth - (targetRect.right - uiData.x) + extra,
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y) + extra,
        })
    }

    useEffect(() => {

        geve.on('focus', (isFocused) => setFocus(isFocused))

        if (window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf('-dev') >= 0) { /** let's go **/ }
        else { return null }

        window.ReadSimulation = (n = 10) => setIsModalOpen(true) || setTimeout(async () => {

            document.getElementsByTagName('body')[0].style.filter = "hue-rotate(45deg)"
            console.clear()
            console.log(`SIMULATION STARTING [${window.location.hostname}] ...`)

            setState('Loading')
            addTimeLine(`Test starting ...`)

            const delay = 400
            const fast = 250
            const operationDelay = 750
            const rows = n
            const TypeId = 531

            window.report = {}

            addTimeLine(`Routing to "Home Module"`)
            await AsyncWait(delay) && navigate('/')

            addTimeLine(`Routing to "Personnel Module"`)
            await AsyncWait(delay) && navigate('/personnel')

            addTimeLine(`Routing to "Assets Module"`)
            await AsyncWait(delay) && navigate('/assets')

            addTimeLine(`Routing to "Maintenance Module"`)
            await AsyncWait(delay) && navigate('/maintenance')

            addTimeLine(`Routing to "Allocations Module"`)
            await AsyncWait(delay) && navigate('/allocations')

            addTimeLine(`Triggering ${rows} ID Reader event`)
            await AsyncWait(operationDelay)
            const _personnel = await fetch(`${endpoint}/api/Personnels/?Page=1&PageSize${rows}`)
            const { Data: { Personnel } } = await _personnel.json()
            for (const x of Personnel) await AsyncWait(fast) && ReadPerson(x.CardNum)

            addTimeLine(`Triggering ${rows} RFID Reader event`)
            await AsyncWait(operationDelay)
            const _assets = await fetch(`${endpoint}/api/Assets/?TypeId=${TypeId}&Page=1&PageSize=${rows}&DepartmentId=${kv('department', ['1'])}`)
            const { Data: { Asset } } = await _assets.json()
            for (const x of Asset) await AsyncWait(fast) && ReadAsset(x.Rfid)

            addTimeLine(`Opening Issue/Return Modal`)
            await AsyncWait(operationDelay) && navigate(`/allocations#open_${Date.now()}`)

            addTimeLine(`Allocating ${rows} items for ${rows} person`)
            await AsyncWait(operationDelay)

            for (let i = 0; i < rows; i++) {

                await AsyncWait(delay) && ReadPerson(Personnel[i]?.CardNum)
                await AsyncWait(delay) && ReadAsset(Asset[i]?.Rfid)
                await AsyncWait(operationDelay)

            }

            addTimeLine(`Closing Issue/Return Modal`)
            await AsyncWait(operationDelay) && navigate(`/allocations#close_${Date.now()}`)

            addTimeLine(`Returning ${rows} items from ${rows} person`)
            for (const x of Asset) await AsyncWait(delay) && ReadAsset(x.Rfid)

            await AsyncWait(operationDelay)
            addTimeLine(`Finalizing the simulation process`)
            await AsyncWait(operationDelay)

            setItems([])
            let tcs = 0
            let tss = 0
            let trq = 0
            for (const x in window.report) {
                const [_c, _s, _t] = window.report[x]
                const cs = (_c / 1000).toFixed(2)
                const ss = (_s / 1000).toFixed(2)
                tcs += _c
                tss += _s
                trq += _t
                addTimeLine(`Total ${cs}(s) / Server ${ss}(s)`, `${x.substring(0, 32)} ${((_s / _t) / 1000).toFixed(2)}(s)`)
            }

            document.getElementsByTagName('body')[0].style.filter = "saturate(1)"
            addTimeLine(`Total ${(tcs / 1000).toFixed(2)}(s) / Server ${(tss / 1000).toFixed(2)}(s)`, `Result ${((tss / trq) / 1000).toFixed(2)}(s)`)
            setState('')
            console.log(`Details`, window.report)

        }, 1000)

    }, [])

    const handleOk = () => { alert(`Paused, Please "OK" to resume`) }
    const handleCancel = () => { window.location.reload() }

    return <Modal
        title={
            <span
                style={{ display: 'block', width: '100%', cursor: 'move' }}
                onMouseOver={() => { if (disabled) setDisabled(false) }}
                onMouseOut={() => setDisabled(true)}
            >Simulation-based testing {isOnFocus ? null : <b style={{ color: 'red' }}>(Please focus on the page)</b>}</span>
        }
        size="small"
        open={isModalOpen}
        onOk={handleOk}
        okText={'Pause'}
        onCancel={handleCancel}
        cancelText={'Stop'}
        width={580}
        zIndex={1000 * 2}
        modalRender={(modal) => (
            <Draggable
                disabled={disabled}
                bounds={bounds}
                nodeRef={draggleRef}
                onStart={(event, uiData) => onStart(event, uiData)}
            ><div ref={draggleRef}>{modal}</div></Draggable>
        )}
    >
        <Wrapper style={{ margin: `28px 0 ${state === 'Loading' ? '-48px' : '-36px'} 0` }}>
            <Timeline
                mode='left'
                size="small"
                pending={state}
                items={items}
            />
        </Wrapper>
    </Modal>

}