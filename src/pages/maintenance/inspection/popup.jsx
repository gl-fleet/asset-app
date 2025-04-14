import React, { useRef, useState, useEffect } from 'react'
import { Modal, Form, Empty, Spin, Button, Input, DatePicker, Select, Typography, Tag, Badge, Divider, Segmented } from 'antd'
import { RadiusUpleftOutlined, SearchOutlined, FormOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import moment from 'moment'
import dayjs from 'dayjs'

import { ErrorResponse, kv, df, myAccess, inspection_list } from '../../../common/utils'
import PersonPopover from '../../../common/popover/person'
import AssetPopover from '../../../common/popover/asset'
import { useBridge } from '../../../hooks/bridge'
import { useScreen } from '../../../hooks/screen'

const { Text } = Typography
const { TextArea } = Input

const PaneBody = ({ ctx, data }) => {

    const [{ get, set, put }, { get: _get, set: _set, put: _put, emit }] = useBridge({ url: 'AssetInspectionHistory' })

    const [form] = Form.useForm()
    const { AssetId = null, Settings = {} } = data
    const { CheckType = {} } = Settings
    const { type, key } = ctx

    useEffect(() => {

        type === 'Edit' && _get(key, (s, e) => {
            s == 'then' && form.setFieldsValue({ ...e })
        })

    }, [type, key])

    const handleOk = (e) => {

        const body = {
            "Id": e.Id ?? 0,
            "AssetId": e.AssetId ?? AssetId,
            "CheckTypeId": e.CheckTypeId ?? CheckType.Id,
            "CheckStatus": 0,
            'CheckedDateTime': dayjs(e.CheckedDate).format(df),
            'CheckedUserId': Number(kv('PersonnelNo', ['0'])),
            "Description": e.Description,
        }

        if (typeof e === 'object' && e.hasOwnProperty('Id') && typeof e.Id === 'number') {

            _put(e.Id, body, (s, n) => s === 'then' && emit('AssetInspectionHistory', 'refetch'))

        } else {

            _set(body, (s, n) => s === 'then' && emit('AssetInspectionHistory', 'refetch'))

        }

    }

    return <Form
        form={form}
        size={'small'}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        onFinish={handleOk}
    >

        <div style={{ display: 'block', height: 12 }} />

        {type === 'Edit' ? <Form.Item hidden name={'Id'} label="Id"><Input /></Form.Item> : null}
        {type === 'Edit' ? <Form.Item hidden name={'AssetId'} label="Id"><Input /></Form.Item> : null}
        {type === 'Edit' ? <Form.Item hidden name={'CheckTypeId'} label="Id"><Input /></Form.Item> : null}

        <Form.Item label="Status" name="Status" initialValue={'Active'}>
            <Select style={{ width: '100%' }} disabled={true} options={[{ value: 'Active', label: 'Active' }]} />
        </Form.Item>

        <Form.Item label="Description" name="Description">
            <TextArea placeholder="Minimum and maximum number of lines" autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>

        <Form.Item label="CheckedDate" name="CheckedDate" initialValue={dayjs()}>
            <DatePicker disabled format={df} />
        </Form.Item>

        {/** *** *** *** *** *** *** **/}

        <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'right', marginBottom: 16 }}>
            <ErrorResponse error={[...set.error, ...put.error]} extra={<br />} />
            <Button disabled={!myAccess()} icon={myAccess() ? null : <LockOutlined />} loading={set.loading || put.loading} size="medium" type="primary" htmlType="submit">Submit</Button>
        </Form.Item>

    </Form>

}

export default ({ channel = 'ins-pop', event, args = { type: '', key: '' } }) => {

    const [AssetType, _AssetType] = useBridge({ url: 'AssetTypes', get: [] })
    const [Assets, _Assets] = useBridge({ url: 'Assets' })

    const [ctx, setCtx] = useState({ title: '', type: '', key: '', open: false })
    const [_, set_] = useState({ data: null, error: null, loading: false })

    const [pane, setPane] = useState('')
    const [panes, setPanes] = useState([])
    const [context, setContext] = useState({})

    useEffect(() => {

        const getSettingsByAssetId = (id) => new Promise((res, rej) => _Assets.get(id, (s, e) => {

            s === 'catch' && rej(`Couldn't get an asset!`)
            s === 'then' && _AssetType.get(e.AssetTypeId, (s0, { Name, AssetCheckTypeSettings }) => {

                s0 === 'catch' && rej(`Couldn't get a type!`)
                s0 === 'then' && res({ AssetId: id, AssetType: Name, AssetSettings: AssetCheckTypeSettings })

            })

        }))

        const fill = (t, e) => {

            if (typeof e !== 'object' || !Array.isArray(e.AssetSettings)) return null

            const obj = {}
            const ls = e.AssetSettings.filter(({ Enabled }) => Enabled === 1).map(({ CheckTypeId, CheckType: { CheckName } }) => CheckName)

            e.AssetSettings.filter(({ Enabled }) => Enabled === 1).forEach((n) => {
                obj[n.CheckType.CheckName] = {
                    AssetId: e.AssetId,
                    AssetType: e.AssetType,
                    Settings: n
                }
            })

            if (Array.isArray(ls)) {
                setContext(obj)
                setPanes(ls)
                setPane(ls[0])
            }

        }

        const pop = ([type, key]) => {

            if (type === 'Create') {

                setCtx({ title: `${type} #${key}`, type, key: key, open: true })
                getSettingsByAssetId(key)
                    .then(e => fill(type, e))
                    .catch(e => set_({ ..._, error: e }))

            }

            if (type === 'Edit') {

                setCtx({ title: `${type} #${key}`, type, key: key, open: true })
                setContext({})
                setPanes(['Edit'])
                setPane('Edit')

            }

        }

        /** Considering it has called from Asset(s) module **/
        if (args && args.type === 'Create' && args.key !== null) pop([args.type, Number(args.key)])

        event.on(channel, pop)
        return () => event.off(channel, pop)

    }, [])

    const content = panes.length > 0 ? <div>

        {_.error ? <Empty description={<Text type="warning">{_.error}</Text>} /> : null}

        <Divider variant='dashed' orientation="right">
            <Segmented value={pane} size="small" options={panes} onChange={(e) => setPane(e)} />
        </Divider>

        <Spin spinning={false}>
            <PaneBody ctx={ctx} data={context[pane] ?? {}} />
        </Spin>

    </div> : <Empty />

    return args.type === 'Create' ? content : <>
        <Modal
            title={<><RadiusUpleftOutlined style={{ color: '#1677ff' }} /><Text id="title" strong style={{ paddingLeft: 6 }}>{ctx.title}</Text></>}
            open={ctx.open}
            forceRender
            footer={null}
            onCancel={() => setCtx({ ...ctx, open: false })}
        >{content}</Modal >
    </>

}