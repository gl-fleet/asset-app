import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Segmented, Input, Button, Modal, Table, Tooltip, Divider, Spin } from 'antd'
import { DeleteOutlined, DownloadOutlined, LoadingOutlined, LockOutlined } from '@ant-design/icons'
import { myAccess, IsMasterTab, Broadcast, access_level } from '../../utils'
import styled from 'styled-components'

const LetMeWrap = styled.section`
    .ant-form-item {
        margin-bottom: 12px;
    }
`

class Reader {

    readers = {}

    constructor() { }

    add = async (port, idx, updateState) => {

        const { usbProductId = `0x${idx}`, usbVendorId = `0x${idx}` } = port.getInfo()

        if (usbProductId && usbVendorId) {

            const key = `${usbProductId}x${idx}_${usbVendorId}x${idx}`

            if (this.readers.hasOwnProperty(key)) {
                console.log(`${key}: Already reading!`)
                return null
            }

            let t = Date.now()
            let id = ''
            let raw = ''
            let ready = false
            this.readers[key] = port

            setInterval(() => {

                if (Date.now() - t > 75 && id) {

                    /* id = id.slice(6)
                    id = id.slice(0, 24) */
                    id = id.slice(4)
                    id = id.slice(0, 24)
                    raw = raw.slice(3)
                    raw = raw.slice(0, 22)
                    updateState(idx, 'value', `#${id},${raw}`)
                    raw = id = ''

                }

            }, 10)

            const put = (n) => {

                const s = n.toString(16).toUpperCase()
                id = id + (s.length === 1 ? `0${s}` : s)
                raw += s
                t = Date.now()

            }

            try {

                await port.open({ baudRate: 9600 })

                while (true) {

                    let reader = port.readable.getReader()

                    try {

                        while (true) {

                            if (ready === false) { updateState(idx, 'value', 'Ready'); ready = true; }
                            const { value, done } = await reader.read()
                            if (done) { break; }
                            for (const x of value) put(x)

                        }

                    } catch (error) {

                        console.log(`${key}: ${error.message}`)
                        updateState(idx, 'value', error.message)

                    } finally {

                        reader.releaseLock()

                    }

                }

            } catch (err) {

                console.log(`${key}: ${err.message}`)
                updateState(idx, 'value', err.message)

            }

        } else {

            console.log(`No VendorID or ProductID detected!`)
            updateState(idx, 'value', 'Invalid device')

        }

    }

}

const SerialConfig = ({ geve, setReload }) => {

    const lvl = useMemo(() => access_level(), [])
    const [list, setList] = useState([])
    const readers = useMemo(() => new Reader({ geve }), [])
    const cast = useMemo(() => new Broadcast('serial_port_logger', (value) => {

        IsMasterTab() && geve.emit('serial_port', `${value.split('|')[0]}`)

    }, false), [])

    const update = async (reload = false) => {

        if (reload) {
            setReload('SerialConfig')
            return null
        }

        const ports = await navigator.serial.getPorts()
        const ls = []

        const updateState = (idx, key, value) => {

            const ids = value.split(',')
            IsMasterTab() && geve.emit('serial_port', value)
            // kv('serial_port_logger', `${value}|${Date.now()}`)
            cast.emit(`${value}|${Date.now()}`)
            setList((ls) => { ls[idx][key] = ids[1]; return [...ls]; })

        }

        for (let i = 0; i < ports.length; i++) {

            readers.add(ports[i], i, updateState)
            const { usbProductId = `0x${i}`, usbVendorId = `0x${i}` } = ports[i].getInfo()
            const key = `${usbVendorId}_${usbProductId}`
            ls.push({ key: key, usbProductId, usbVendorId, port: ports[i], state: '...', baudrate: 9600 })

        }

        setList(ls)

    }

    const prompt = () => navigator.serial.requestPort().then((port) => {

        setTimeout(() => {

            const { usbProductId, usbVendorId } = port.getInfo()
            usbProductId === undefined && usbVendorId === undefined && port.forget()
                .then((e) => { })
                .catch((e) => { })
                .finally(() => update())

        }, 500)

    }).catch((err) => { console.log(err) }).finally(() => update(true))

    useEffect(() => {

        navigator.serial.addEventListener("connect", (event) => update(true))
        navigator.serial.addEventListener("disconnect", (event) => update(true))
        // window.addEventListener("storage", (event) => event.key === 'serial_port_logger' && IsMasterTab() && geve.emit('serial_port', `${event.newValue.split('|')[0]}`))
        setTimeout(update)

    }, [])

    const columns = [
        {
            title: '#',
            key: 'key',
            dataIndex: 'key',
        },
        {
            title: 'Product[ID]',
            key: 'usbProductId',
            dataIndex: 'usbProductId',
        },
        {
            title: 'Vendor[ID]',
            key: 'usbVendorId',
            dataIndex: 'usbVendorId',
        },
        {
            title: 'Baudrate',
            dataIndex: 'baudrate',
            key: 'baudrate',
            render: (_, { port }) => <Input disabled size="small" style={{ width: 64 }} value={_} />
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (e) => typeof e === 'string' ? e.replace('#', '') : '...'
        },
        {
            title: 'Action',
            dataIndex: 'address',
            key: 'address',
            render: (_, { port }) => <center><Button disabled={lvl > 3} icon={lvl > 3 ? <LockOutlined /> : <DeleteOutlined />} size="small" type="dashed" onClick={() => port.forget().finally(() => update())} /></center>
        }
    ]

    return <div>
        <Table size="small" columns={columns} dataSource={list} pagination={false} />
        <div style={{ textAlign: 'right' }}>
            <Tooltip title="CP2102 USB-to-Serial Bridge Driver" size="small">
                <Button href="/CP2102.zip" icon={<DownloadOutlined />} type="dashed" size="small" style={{ marginTop: 8, marginRight: 8 }}>CP2102</Button>
            </Tooltip>
            <Button disabled={lvl > 3} icon={lvl > 3 ? <LockOutlined /> : null} size="small" style={{ marginTop: 8 }} onClick={() => prompt()}>Add device</Button>
        </div>
    </div>

}

const HIDConfig = ({ geve, setReload }) => {

    const lvl = useMemo(() => access_level(), [])
    const [list, setList] = useState([])

    useEffect(() => {

        navigator.hid.addEventListener("connect", ({ device }) => {
            console.log(`HID.Connected: ${device.productName}`)
            update(true)
        })

        navigator.hid.addEventListener("disconnect", ({ device }) => {
            console.log(`HID.Disconnect: ${device.productName}`)
            update(true)
        })

        setTimeout(update)

    }, [])

    const read = async (idx, device) => {
        try {

            if (!device.opened) await device.open()

            setList((ls) => { if (ls.hasOwnProperty(idx)) ls[idx]['value'] = 'Ready'; return [...ls]; })

            let isBusy = false
            setInterval(async () => {

                if (isBusy) return true
                isBusy = true

                try {

                    const bytes1 = new Int8Array(400)
                    bytes1[0] = 0x0
                    bytes1[6 - 1] = 0x0F
                    bytes1[8 - 1] = 0xAA
                    bytes1[10 - 1] = 0x0A
                    bytes1[11 - 1] = 0x20
                    bytes1[13 - 1] = 0x01
                    bytes1[15 - 1] = 0xFF
                    bytes1[16 - 1] = 0xFF
                    bytes1[17 - 1] = 0xFF
                    bytes1[18 - 1] = 0xFF
                    bytes1[19 - 1] = 0xFF
                    bytes1[20 - 1] = 0xFF
                    bytes1[21 - 1] = 0x2B
                    bytes1[22 - 1] = 0xBB

                    await device.sendFeatureReport(0x01, bytes1)
                    const view = await device.receiveFeatureReport(0x01, 0x100)

                    let str = ``
                    for (let i = 0; i < 34; i++) {

                        const c = view.getUint8(i).toString(16).toUpperCase()
                        str += c.length === 1 ? `0${c}` : c

                    }

                    const final = str.slice(24).slice(0, 8)
                    let parsed = final.match(/.{1,2}/g).reverse().join('')

                    if (parsed) {
                        IsMasterTab() && geve.emit('hid_port', `#${parsed}`)
                        setList((ls) => { if (ls.hasOwnProperty(idx)) ls[idx]['value'] = parsed; return [...ls]; })
                    }

                }
                catch (err) { /* KeyValue('iLog') === 'Debug' && (Date.now() % 10000 < 50) && console.log(`HID.Read: ${err.message}`) */ }
                finally { isBusy = false }

            }, 250)

        } catch (err) { console.error(`HID.Read: ${err.message}`) }
    }

    const update = async (reload) => {

        if (reload) {
            setReload('HIDConfig')
            return null
        }
        let devices = await navigator.hid.getDevices()
        const ls = []
        devices.forEach((device, idx) => {

            read(idx, device)
            const { vendorId, productId, productName } = device
            const key = `${vendorId}_${productId}`
            ls.push({ key: key, usbProductId: productId, usbVendorId: vendorId, name: productName, port: device, value: '...' })

        })

        setList(ls)

    }

    const prompt = () => navigator.hid.requestDevice({ filters: [] }).then((devices) => { update(true) })

    const columns = [
        {
            title: '#',
            key: 'key',
            dataIndex: 'key',
        },
        {
            title: 'Product[ID]',
            key: 'usbProductId',
            dataIndex: 'usbProductId',
        },
        {
            title: 'Vendor[ID]',
            key: 'usbVendorId',
            dataIndex: 'usbVendorId',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (e) => typeof e === 'string' ? e.replace('#', '') : '...'
        },
        {
            title: 'Action',
            dataIndex: 'address',
            key: 'address',
            render: (_, { port }) => <center><Button disabled={lvl > 3} icon={lvl > 3 ? <LockOutlined /> : <DeleteOutlined />} size="small" type="dashed" onClick={() => port.forget().finally(() => update())} /></center>
        }
    ]

    return <div>
        <Table size="small" columns={columns} dataSource={list} pagination={false} />
        <div style={{ textAlign: 'right' }}>
            <Button disabled={lvl > 3} icon={lvl > 3 ? <LockOutlined /> : null} size="small" style={{ marginTop: 8 }} onClick={() => prompt()}>Add device</Button>
        </div>
    </div>

}

const AC2000 = ({ geve }) => {

    const [list, setList] = useState([])

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (e) => typeof e === 'string' ? e.replace('#', '') : '...'
        },
        {
            title: 'Action',
            dataIndex: 'address',
            key: 'address',
            render: (_, { port }) => <center><Button size="small" type="dashed" icon={<DeleteOutlined />} onClick={() => { }} /></center>
        }
    ]

    return <div>
        <Table size="small" columns={columns} dataSource={list} pagination={false} />
        <div style={{ textAlign: 'right' }}>
            <Button size="small" style={{ marginTop: 8 }} onClick={() => {
                const id = (prompt('Enter CARD_READER_ID?') ?? '').toUpperCase()
                console.log(id)
            }}>Add device</Button>
        </div>
    </div>

}

export default ({ geve }) => {

    const ioRef = useRef()

    const [tp, setTp] = useState({ open: false, type: 'serial' })
    const [mode, setMode] = useState('Create')
    const [reload, setReload] = useState('')

    const types = [
        {
            label: 'Serial Port',
            value: 'serial',
        },
        {
            label: 'HID Port',
            value: 'hid',
        },
        {
            label: 'AC2000 Port',
            value: 'ac2000',
            disabled: true,
        },
    ]

    useEffect(() => {

        window.ReadPerson = (n) => IsMasterTab() && geve.emit('hid_port', `#${n}`)
        window.ReadAsset = (n) => IsMasterTab() && geve.emit('serial_port', `#${n},${n}`)

        const trigger = ({ open = true, type = 'serial' }) => setTp({ open, type })
        geve.on('greader', trigger)
        return () => geve.off('greader', trigger)

    }, [])

    useEffect(() => { if (reload !== '') setTimeout(() => setReload(''), 1000) }, [reload])

    const props = { ...tp, geve, mode, io: ioRef.current, setReload }

    return <LetMeWrap>

        <Modal
            title={
                <Segmented
                    onChange={(e) => setTp({ ...tp, type: e })}
                    options={types}
                    value={tp.type}
                />
            }
            forceRender={true}
            destroyOnClose={false}
            open={tp.open}
            onCancel={() => setTp({ open: false })}
            footer={null}
            width={780}
        >

            <Divider orientation="right" dashed />

            <div style={{ display: tp.type === 'serial' ? 'block' : 'none' }} >
                {reload === 'SerialConfig' ? <Spin style={{ width: '100%' }} indicator={<LoadingOutlined spin />} /> : <SerialConfig {...props} />}
            </div>

            <div style={{ display: tp.type === 'hid' ? 'block' : 'none' }} >
                {reload === 'HIDConfig' ? <Spin style={{ width: '100%' }} indicator={<LoadingOutlined spin />} /> : <HIDConfig {...props} />}
            </div>

            <div style={{ display: tp.type === 'ac2000' ? 'block' : 'none' }} >
                {reload === 'AC2000' ? <Spin style={{ width: '100%' }} indicator={<LoadingOutlined spin />} /> : <AC2000 {...props} />}
            </div>

        </Modal>

    </LetMeWrap>

}