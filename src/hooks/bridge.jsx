import axios from 'axios'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openMessage } from '../store/message'
import { emitBridge } from '../store/bridge'
import { BetterLog, ResponseParser, ErrorParser, QueryParam, kv, endpoint, xhr_states, myAccess, Sfy } from '../common/utils'
import { createHttpAgent, createHttpsAgent, IDB } from '../common/utils'
import { nanoid } from 'nanoid'

axios.defaults.httpAgent = createHttpAgent()
axios.defaults.httpsAgent = createHttpsAgent()

const DB = new IDB()

/** Ignoring **/
const RoleMapping = {

    'Departments': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get'],
        'level-3': ['get'],
        'level-4': ['get'],
    },

    'Personnels': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get'],
        'level-3': ['get'],
        'level-4': ['get'],
    },

    'Assets': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put', 'del'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    'AssetTypes': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put', 'del'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    'DepartmentAssetTypes': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put', 'del'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    'AssetAllocations': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put', 'del'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    'MinlogIntegration': {
        'level-1': ['get'],
        'level-2': ['get'],
        'level-3': ['get'],
        'level-4': ['get'],
    },

    'AssetAllocations/Return': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put', 'del'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    'AssetAllocations/Assign': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put', 'del'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    'Configuration': {
        'level-1': ['get', 'set', 'put', 'del'],
        'level-2': ['get', 'set', 'put'],
        'level-3': ['get', 'set', 'put'],
        'level-4': ['get'],
    },

    '*': {
        'level-1': ['get'],
        'level-2': ['get'],
        'level-3': ['get'],
        'level-4': ['get'],
    }

}

/**
 * useBridge is REST Interface
 * @param {*} cfg
 * @returns 
 */
export const useBridge = (cfg = {}) => {

    const config = useMemo(() => ({ url: '', time: Date.now(), message: true, get: {}, set: {}, put: {}, del: {}, ref: {}, checkAuth: true, ...cfg }), [])
    const bLog = useMemo(() => new BetterLog(), [])
    const history = useRef({})
    const callback = useRef(null)
    const dispatch = useDispatch()
    const cache = useRef({})
    const headers = {
        headers: {
            Authorization: `Bearer ${kv('token', ['-'])}`,
            DepartmentId: kv('department', [1]),
            PersonnelNo: kv('PersonnelNo', ['-']),
            AppVersion: kv('version', ['-']),
            ...(config.headers ?? {}),
        }
    }
    const isDebug = useMemo(() => kv('iLog', ['Info']) === 'Debug', [])
    const _ = useMemo(() => ({ ...xhr_states(config.url, config.states ?? {}) }), [])
    const { key, from, to, payload } = useSelector((state) => state.bridge)
    const [data, setData] = useState({

        get: { loading: false, data: config.get, error: [] },
        set: { loading: false, data: config.set, error: [] },
        put: { loading: false, data: config.put, error: [] },
        del: { loading: false, data: config.del, error: [] },
        ref: { loading: false, data: config.ref, error: [] },
        can: myAccess()

    })

    useEffect(() => {

        if (to !== config.url && callback.current) return
        callback.current && callback.current({ key, from, to, payload })

    }, [key, from, to, payload])

    const message = (i, t, payload = {}) => {

        const show = () => config.message === true && dispatch(openMessage({ ...payload }))

        /** Show Errors **/
        if (i === 2) { show(); return true; }

        /** Hide Get/Ref Responses **/
        if (['get', 'ref'].includes(t)) { return false }

        /** Show all others **/
        if (true) { show(); return true; }

    }

    const _load = (t, meta, input) => {

        /** Will wait for the response of same requests **/
        if (cache.current[meta.reqId] === true) return false
        cache.current[meta.reqId] = true

        meta.cs = Date.now()
        setData((c) => { let n = c; n[t].loading = true; n[t].error = []; return { ...n }; }) /** n[t].error = [] "is added to clear the previous errors" */
        message(0, t, { key: _[t][0], content: _[t][1], type: 'loading', duration: 15 })

        isDebug && bLog.add('REQUEST', 0, `${t}:${config.url}:${meta.key}`, input)
        return true

    }

    const _then = (t, cb, e, meta) => {

        const data = ResponseParser(e, config[t], meta)
        meta.status = true
        cb !== null && cb('then', data)
        setData((c) => { let n = c; n[t].loading = false; n[t].data = data; return { ...n }; })
        message(1, t, { key: _[t][0], content: _[t][2], type: 'success', duration: 1 })

        isDebug && bLog.add('RESOLVED', 1, `${t}:${config.url}:${meta.key}`, e)

    }

    const _catch = (t, cb, e, meta) => {

        let txt = `${_[t][1]}: ${e.message}`
        const data = ErrorParser(e, {}, meta)
        txt = txt.length > 32 ? txt.slice(0, 32) + '...' : txt
        meta.status = false
        cb !== null && cb('catch', data)
        setData((c) => { let n = c; n[t].loading = false; n[t].error = data; return { ...n }; })
        // message(2, t, { key: _[t][0], content: txt, type: 'error', duration: 3 })
        message(2, t, { key: _[t][0], content: data[0] ?? txt, type: 'error', duration: 3 })

        isDebug && bLog.add('REJECTED', 2, `${t}:${config.url}:${meta.key}`, e)

    }

    const _finally = (t, cb, meta) => {

        delete cache.current[meta.reqId]

        meta.ce = Date.now()
        meta.cd = meta.ce - meta.cs
        cb !== null && cb('finally', meta)

        const { cs, ce, ss, se } = meta
        meta.q = `🌐 ${ss <= 0 ? -1 : ss - cs}ms ${se === 0 || ss === 0 ? -1 : se - ss}ms ${se === 0 ? -1 : ce - se}ms`

        isDebug && DB.add(cs, ce, ce - cs, 'bridge', `${t}:${config.url}/${meta.type ?? '*'} -> ${meta.q} [${meta.status ? 'success' : 'fail'}]`)
        isDebug && bLog.add('RESULT', 3, `${t}:${config.url}:${meta.key}`, meta)

        if (window.hasOwnProperty('report')) {

            if (!window.report.hasOwnProperty(`${t}->${config.url}`)) window.report[`${t}->${config.url}`] = [0, 0, 0]

            window.report[`${t}->${config.url}`][0] += ce - cs
            window.report[`${t}->${config.url}`][1] += se - ss
            window.report[`${t}->${config.url}`][2] += 1

        }

    }

    const actions = useMemo(() => ({

        get: (filter = {}, cb = null, type = null) => {

            const t = 'get'
            const reqId = `${config.url}_${t}_${Sfy({ filter })}`
            const meta = { reqId, method: t, endpoint: config.url, key: nanoid(), type, cs: 0, ce: 0, cd: 0, ss: 0, se: 0, sd: 0 }
            const query = typeof filter === 'string' && filter === 'refetch' ? history.current.get : filter
            history.current.get = query

            _load(t, meta, query) && axios.get(`${endpoint}/api/${config.url}/${QueryParam(query)}`, headers)
                .then((e) => _then(t, cb, e, meta))
                .catch((e) => _catch(t, cb, e, meta))
                .finally(() => _finally(t, cb, meta))

        },

        set: (body = {}, cb = null, type = null) => {

            const t = 'set'
            const reqId = `${config.url}_${t}_${Sfy({ body })}`
            const meta = { reqId, method: t, endpoint: config.url, key: nanoid(), type, cs: 0, ce: 0, cd: 0, ss: 0, se: 0, sd: 0 }

            if (config.checkAuth && !myAccess()) _catch(t, cb, { message: 'You are not authorized to perform this operation!' }, meta)
            else _load(t, meta, body) && axios.post(`${endpoint}/api/${config.url}`, body, headers)
                .then((e) => _then(t, cb, e, meta))
                .catch((e) => _catch(t, cb, e, meta))
                .finally(() => _finally(t, cb, meta))

        },

        put: (id, body = {}, cb = null, type = null) => {

            const t = 'put'
            const reqId = `${config.url}_${t}_${Sfy({ id })}`
            const meta = { reqId, method: t, endpoint: config.url, key: nanoid(), type, cs: 0, ce: 0, cd: 0, ss: 0, se: 0, sd: 0 }

            if (config.checkAuth && !myAccess()) _catch(t, cb, { message: 'You are not authorized to perform this operation!' }, meta)
            else _load(t, meta, body) && axios.put(`${endpoint}/api/${config.url}/${id}`, body, headers)
                .then((e) => _then(t, cb, e, meta))
                .catch((e) => _catch(t, cb, e, meta))
                .finally(() => _finally(t, cb, meta))

        },

        del: (id, cb = null, type = null) => {

            const t = 'del'
            const reqId = `${config.url}_${t}_${Sfy({ id })}`
            const meta = { reqId, method: t, endpoint: config.url, key: nanoid(), type, cs: 0, ce: 0, cd: 0, ss: 0, se: 0, sd: 0 }

            if (config.checkAuth && !myAccess()) _catch(t, cb, { message: 'You are not authorized to perform this operation!' }, meta)
            else _load(t, meta, id) && axios.delete(`${endpoint}/api/${config.url}/${id}`, headers)
                .then((e) => _then(t, cb, e, meta))
                .catch((e) => _catch(t, cb, e, meta))
                .finally(() => _finally(t, cb, meta))

        },

        emit: (to, payload) => {

            dispatch(emitBridge({ key: Date.now(), from: config.url, to, payload }))

        },

        on: (cb = null) => {

            callback.current = cb

        },

        clear: (t = 'get') => {

            setData((c) => {
                let n = c
                n[t].loading = false
                n[t].data = config[t]
                n[t].error = []
                return { ...n }
            })

        }

    }), [])

    return [data, actions]

}