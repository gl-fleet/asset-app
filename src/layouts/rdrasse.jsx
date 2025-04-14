import React, { useEffect, useRef, useMemo } from "react"
import { Badge, Typography } from 'antd'
import { Link } from "react-router-dom"
import { LoadingOutlined, CloseCircleOutlined, NodeExpandOutlined } from '@ant-design/icons'

import { Broadcast, Sfy, kv, commonArgs } from '../common/utils'
import { useBridge } from '../hooks/bridge'

const { Text } = Typography

export default ({ geve, notifyAPI, messageAPI }) => {

    const [{ }, { set }] = useBridge({ url: 'AssetAllocations/Return', states: { set: ['Returning', 'Returned', 'Returning failed'] } })
    const [{ }, { get }] = useBridge({ url: 'Assets', cache: true })
    const departments = useMemo(() => { try { return JSON.parse(kv('departments', ['{}'])) } catch (err) { return {} } }, [])
    const cast = useMemo(() => new Broadcast('asset-reader', (value) => geve.emit('asset-data', value)), [])
    const store = useRef({})

    const run_serial = () => {

        try {

            let pre_rfid = ''
            let pre_time = Date.now()
            let isReturned = null

            const AssetReturn = (AssetAllocationId, AssetId, TypeName) => new Promise((res, rej) => {

                if (AssetAllocationId === null) res(true)
                else {

                    const key = `alloc_return_root`
                    const ReturnedUserId = Number(kv('PersonnelNo', ['0']))
                    const shouldReturn = kv('IsIssueOpen', ['false']) === 'false'
                    const cur = `${AssetAllocationId}_${AssetId}_${ReturnedUserId}`

                    if (!shouldReturn) { isReturned = null }

                    if (!shouldReturn || (isReturned === cur)) { res(true); return; }

                    messageAPI.open({ key, type: 'loading', content: `Returning ...`, duration: 0 })

                    set({ AssetAllocationId, AssetId, ReturnedUserId }, (is, e) => {

                        if (is === 'then') {

                            isReturned = `${AssetAllocationId}_${AssetId}_${ReturnedUserId}`
                            messageAPI.open({ key, type: 'success', content: `Returned`, duration: 2 })
                            geve.emit('AssetAllocations', 'refetch')

                        }

                        if (is === 'catch') messageAPI.open({ key, type: 'error', content: e[0], duration: 2 })

                        if (is === 'finally') res(true)

                    }, TypeName)

                }

            })

            const parsed = (rfid) => {

                if (pre_rfid === rfid && (Date.now() - pre_time) <= 1250) return
                pre_rfid = rfid
                pre_time = Date.now()
                const marginTop = 11

                kv('mousemove', `${Date.now()}`)

                geve.emit('asset-reader', ({ key: rfid, loading: true, data: { Rfid: rfid } }))

                const cut = (x = '...') => x.length > 28 ? x.substring(0, 28) + '...' : x

                notifyAPI.open({
                    key: rfid,
                    icon: <LoadingOutlined style={{ fontSize: 14, marginTop, color: '#108ee9' }} />,
                    message: <span>{cut(`RFID: ${rfid}`)}</span>,
                    placement: 'bottomLeft',
                })

                setTimeout(() => {

                    const then = (e, cache = 0) => {

                        if (cache > 0) store.current[rfid] = { end: Date.now() + cache, value: e }
                        const Asset = e.Asset?.[0] ?? {}
                        const { Id, Serial, TypeName, LastAllocationId, DepartmentId, Status } = Asset

                        if (typeof Id === 'number') {

                            if (Status === null || Status === 'Active') {

                                AssetReturn(LastAllocationId, Id, TypeName).then(() => {

                                    geve.emit('asset-reader', ({ key: rfid, loading: true, data: Asset }))
                                    // KeyValue('asset-reader', Sfy({ Id, Serial, TypeName, Time: Date.now() }))
                                    cast.emit(Sfy({ Id, Serial, TypeName, Time: Date.now() }))

                                    notifyAPI.open({
                                        key: rfid,
                                        icon: <NodeExpandOutlined style={{ fontSize: 14, marginTop }} />,
                                        message: <Link to={`/assets/${Id}`}>
                                            <Text>{cut(`${TypeName}`)}</Text>
                                            <b style={{ marginLeft: 6 }}>{`[ ${Serial} ]`}</b>
                                        </Link>,
                                        placement: 'bottomLeft',
                                        showProgress: true,
                                    })

                                })

                            } else {

                                const status = Status ?? 'Active'
                                const color = 'danger' // StatesColorMap[status]
                                const isDepOk = DepartmentId === commonArgs.DepartmentId
                                const depName = departments[DepartmentId] ?? '-'

                                notifyAPI.open({
                                    key: rfid,
                                    icon: <NodeExpandOutlined style={{ fontSize: 14, marginTop }} />,
                                    message: <Link to={`/assets/${Id}`} title={depName}>
                                        <Text delete>{cut(`${TypeName}`)}</Text>
                                        <Badge dot={!isDepOk} style={{ right: -4, top: 2 }}>
                                            <Text type={color} style={{ fontWeight: 800, marginLeft: 6, textTransform: "capitalize" }} strong={true}>{`[ ${status} ]`}</Text>
                                        </Badge>
                                    </Link>,
                                    placement: 'bottomLeft',
                                    showProgress: true,
                                })

                            }

                        } else {

                            notifyAPI.open({
                                key: rfid,
                                icon: <NodeExpandOutlined style={{ fontSize: 14, marginTop, color: '#108ee9' }} />,
                                message: <span style={{ color: 'orange' }}>Asset not found</span>,
                                placement: 'bottomLeft',
                                showProgress: true,
                            })

                        }

                    }

                    if (store.current.hasOwnProperty(rfid)) then(store.current[rfid].value, 0)
                    else get({
                        DepartmentId: Number(kv('department', ['1'])),
                        FilterField: (rfid ?? "").indexOf(',') !== -1 ? 'Rfid,Rfid' : 'Rfid',
                        FilterValue: rfid,
                        PageSize: 20,
                        Page: 1,
                        SortOrder: 'asc'
                    }, (is, e) => {

                        if (is === 'then') then(e, 5000)
                        if (is === 'catch') notifyAPI.open({
                            key: id,
                            icon: <CloseCircleOutlined style={{ fontSize: 14, marginTop, color: 'orange' }} />,
                            message: <span>{cut(e[0])}</span>,
                            placement: 'bottomLeft',
                        })

                    })

                })

            }

            geve.on('serial_port', (id) => {

                id && id[0] === '#' && parsed(id.replace('#', ''))

            })

        } catch (err) { }

    }

    useEffect(() => {

        // window.addEventListener("storage", (event) => event.key === 'asset-reader' && geve.emit('asset-data', JSON.parse(event.newValue)))
        run_serial()

        setInterval(() => {

            for (const key in store.current) {
                const { end } = store.current[key]
                if (Date.now() >= end) { delete store.current[key] }
            }

        }, 250)

    }, [])

    return null

}