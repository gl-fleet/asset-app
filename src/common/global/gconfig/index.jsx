import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Modal, Form, Divider, Space, Typography } from 'antd'
import { Segmented, Switch, Result } from 'antd'
import styled from 'styled-components'
import { Dexie } from 'dexie'

import { KeyValue, myAccess, kv, Now, access_level } from '../../utils'
import { useBridge } from '../../../hooks/bridge'

const LetMeWrap = styled.section`
    .ant-form-item {
        margin-bottom: 12px;
    }
`

const SystemConfig = () => {

    const lvl = useMemo(() => access_level(), [])

    if (lvl > 2) return <Result
        style={{ padding: '0px 0px 16px ' }}
        status="403"
        subTitle="You are not authorized to perform this operation"
    />

    const [form] = Form.useForm()
    const [{ get }, conf] = useBridge({ url: 'Configuration', get: [] })

    useEffect(() => { conf.get({ DepartmentId: Number(kv('department', ['1'])) }) }, [])

    const obj = useMemo(() => {

        const prev = {}
        const next = {}
        for (const x of get.data) {

            prev[x.ConfigDesc] = x
            next[x.ConfigDesc] = x.IsEnabled

        }

        return { prev, next }

    }, [get.loading])

    /**
     * 0 -> All Off
     * 1 -> Skip Spare
     * 2 -> Check all
     */

    return get.loading ? 'loading' : <Form
        form={form}
        name="main_fields"
        size={'small'}
        layout="horizontal"
        labelCol={{ xs: { span: 24 }, sm: { span: 12 } }}
        wrapperCol={{ xs: { span: 24 }, sm: { span: 12 } }}
        initialValues={{ ...obj.next }}
        onValuesChange={(e) => {

            const key = Object.keys(e)[0]
            const prev = obj?.prev[key] ?? null

            if (prev) conf.put(prev.ConfigId, {
                ConfigId: prev.ConfigId,
                DepartmentId: Number(kv('department', ['1'])),
                ConfigDesc: key,
                IsEnabled: typeof e[key] === 'boolean' ? (e[key] ? 1 : 0) : (e[key]),
                ConfigValue: "Required",
                configuration: "",
            }) // , (is) => is === 'catch' && conf.get('refetch'))

            else conf.set({
                DepartmentId: [Number(kv('department', ['1']))],
                ConfigDesc: key,
                IsEnabled: typeof e[key] === 'boolean' ? (e[key] ? 1 : 0) : (e[key]),
                ConfigValue: "Required",
                configuration: "",
            }) // , (is) => is === 'catch' && conf.get('refetch'))

        }}
    >

        <Form.Item label="Minlog WIFI Detection" name='Caplamp Detection'>
            {/* <Switch defaultChecked /> */}
            <Segmented
                size='small'
                options={[
                    { value: 2, label: 'On' },
                    { value: 0, label: 'Off' },
                    { value: 1, label: 'Skip Spare' },
                ]}
            />
        </Form.Item>

        <Form.Item label="Caplamp last detected time limit" name='Caplamp last detected time limit'>
            <Switch defaultChecked={false} />
        </Form.Item>

        <Form.Item label="PPE history check before deletion" name='PPE history check before deletion'>
            <Switch defaultChecked={false} />
        </Form.Item>

        <Form.Item label="PLI Assign / Caplamp Assign" name='PLI assign / Caplamp assign'>
            <Switch /* checkedChildren="PLI" unCheckedChildren="Caplamp" */ />
        </Form.Item>

    </Form>

}

const DebugConfig = () => {

    const lvl = useMemo(() => access_level(), [])

    if (lvl > 3) return <Result
        style={{ padding: '0px 0px 16px ' }}
        status="403"
        subTitle="You are not authorized to perform this operation"
    />

    const [isDebug, setDebug] = useState((KeyValue('iLog') ?? 'Info') === 'Debug')

    const [form] = Form.useForm()

    const download = () => {

        const db = new Dexie('AssetAllocation_DB')
        db.version(1).stores({ logs: 'start, end, duration, type, version, user, department, text' })
        db.logs.toArray().then(e => {

            // Turn the JSON object into a string
            const data = JSON.stringify(e)

            // Pass the string to a Blob and turn it
            // into an ObjectURL
            const blob = new Blob([data], { type: "application/json" })
            const jsonObjectUrl = URL.createObjectURL(blob)

            // Create an anchor element, set it's
            // href to be the Object URL we have created
            // and set the download property to be the file name
            // we want to set
            const filename = `logs_${Now()}.json`
            const anchorEl = document.createElement("a")
            anchorEl.href = jsonObjectUrl
            anchorEl.download = filename

            // There is no need to actually attach the DOM
            // element but we do need to click on it
            anchorEl.click()

            // We don't want to keep a reference to the file
            // any longer so we release it manually
            URL.revokeObjectURL(jsonObjectUrl)

        }).catch(console.log)

    }

    const onValuesChanged = (changed, all) => {
        if (changed && changed.hasOwnProperty('logging')) setDebug(changed['logging'] === 'Debug')
    }

    return <Form
        form={form}
        name="main_fields"
        size={'small'}
        layout="horizontal"
        labelCol={{ xs: { span: 24 }, sm: { span: 10 } }}
        wrapperCol={{ xs: { span: 24 }, sm: { span: 10 } }}
        onValuesChange={onValuesChanged}
        initialValues={{
            language: KeyValue('iLang') ?? 'EN',
            assign: KeyValue('iAssign') ?? 'Drawer',
            screen: KeyValue('iScreen') ?? 'Off',
            logging: KeyValue('iLog') ?? 'Info',
            socket: KeyValue('iSocket') ?? 'On',
            inspection: KeyValue('iInspection') ?? 'On',
            channel: KeyValue('iChannel') ?? 'ChannelAPI',
        }}
    >

        <Form.Item label="Localization" name='language'>
            <Segmented
                size={'small'}
                options={['EN', 'MN']}
                onChange={(value) => KeyValue('iLang', value ?? 'EN')}
            />
        </Form.Item>

        <Form.Item label="Assign window" name='assign'>
            <Segmented
                size={'small'}
                options={['Drawer', 'Modal']}
                onChange={(value) => KeyValue('iAssign', value ?? 'Drawer')}
            />
        </Form.Item>

        <Form.Item label="Logging" /* name='logging' */ >
            <Space align='start'>
                <Form.Item name='logging' style={{ marginBottom: 0 }}>
                    <Segmented
                        size={'small'}
                        options={['Info', 'Debug']}
                        onChange={(value) => KeyValue('iLog', value ?? 'Info')}
                    />
                </Form.Item>
                <Typography.Link disabled={!isDebug} title={'Download logs'} href="#download" onClick={() => download()}><b>⭳</b> Logs</Typography.Link>
            </Space>
        </Form.Item>

        <Form.Item label="Web Socket" name='socket'>
            <Segmented
                size={'small'}
                options={['On', 'Off']}
                onChange={(value) => KeyValue('iSocket', value ?? 'On')}
            />
        </Form.Item>

        <Form.Item label="Inspection" name='inspection'>
            <Segmented
                size={'small'}
                options={['On', 'Off']}
                onChange={(value) => KeyValue('iInspection', value ?? 'On')}
            />
        </Form.Item>

        <Form.Item label="Browser channel" name='channel'>
            <Segmented
                size={'small'}
                options={['ChannelAPI', 'LocalStorage']}
                onChange={(value) => KeyValue('iChannel', value ?? 'ChannelAPI')}
            />
        </Form.Item>

    </Form >

}

/** *** *** *** [ CONFIG MODAL ] *** *** *** **/

export default ({ geve }) => {

    const ioRef = useRef()

    const [tp, setTp] = useState({ open: false, type: 'system' })
    const [mode, setMode] = useState('Create')

    const types = [
        {
            label: 'System',
            value: 'system',
        },
        {
            label: 'Options',
            value: 'options',
        },
    ]

    useMemo(() => { }, [])

    useEffect(() => {

        const trigger = ({ open = true, type = 'system' }) => setTp({ open, type })
        geve.on('gconfig', trigger)
        return () => geve.off('gconfig', trigger)

    }, [])

    const props = { ...tp, mode, io: ioRef.current }

    return <LetMeWrap>

        <Modal
            title={
                <Segmented
                    onChange={(e) => setTp({ ...tp, type: e })}
                    options={types}
                    value={tp.type}
                />
            }
            forceRender={false}
            destroyOnClose={true}
            open={tp.open}
            onCancel={() => setTp({ open: false })}
            footer={null}
            width={520}
        >

            <Divider orientation="right" dashed>
                <i style={{ fontSize: 12 }}>{tp.type === 'system' ? 'Cloud config' : 'Local config'}</i>
            </Divider>

            {tp.type === 'system' ? <SystemConfig {...props} /> : null}
            {tp.type === 'options' ? <DebugConfig {...props} /> : null}

        </Modal>

    </LetMeWrap>

}