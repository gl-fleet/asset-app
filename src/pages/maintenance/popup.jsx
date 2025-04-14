import React, { useState, useEffect, useRef, useMemo } from 'react'
import { PlusOutlined, RadiusUpleftOutlined, SwapOutlined, UploadOutlined, LockOutlined } from '@ant-design/icons'
import { Modal, Typography, Button, DatePicker, Form, Input, Select, Divider, Spin, Upload, Image } from 'antd'
import dayjs from 'dayjs'

import { ErrorResponse, Tick, KeyValue, kv, df, urls, isSecure, myAccess } from '../../common/utils'
import { useBridge } from '../../hooks/bridge'

const tick = new Tick()
const { Text } = Typography
const { TextArea } = Input

const Uploader = ({ AssetId }) => {

    const id = useMemo(() => typeof AssetId === 'number' && AssetId > 0 ? AssetId : 0, [AssetId])
    const [{ get: getFile }, { get: _getFile }] = useBridge({ url: `assets/GetFile`, get: '' })
    const [uri, setUri] = useState('')
    const [status, setStatus] = useState('')
    const url = isSecure ? urls.api_https : urls.api_http

    useEffect(() => { status === 'done' && setTimeout(() => { id > 0 && _getFile({ AssetId: id }) }, 50) }, [status])
    useEffect(() => { if (id > 0) _getFile({ AssetId: id }) }, [id])
    useEffect(() => { if (getFile.loading === false && getFile.data?.length > 64) setUri(`data:image/png;base64,${getFile.data}`) }, [getFile.loading])

    return <div>
        {uri ? <Image width={'100%'} src={uri} style={{ borderRadius: 4, overflow: 'hidden' }} /> : null}
        {uri.length > 64 ? <div style={{ height: 16 }} /> : null}
        <Upload name="image" action={`${url}/api/assets/UploadFile?AssetId=${id}`} listType="picture" onChange={({ file }) => {
            setStatus(file.status)
        }}>
            <Button loading={getFile.loading} disabled={getFile.loading} icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
    </div>

}

export default ({ event, id = '', id2 = '' }) => {

    const [{ get: Assets }, { get: GetAssets }] = useBridge({ url: 'Assets' })
    const [{ get: Status }, { get: GetStatus }] = useBridge({ url: 'Configuration', get: [] })
    const [{ get: { error, loading, data }, set, put }, { get: GetItem, set: SetItem, put: PutItem, emit }] = useBridge({ url: 'AssetCheckHistories', message: false })

    const [form] = Form.useForm()
    const [AssetId, setAssetId] = useState(0)
    const [open, setOpen] = useState(false)
    const [type, setType] = useState(['', '', ''])
    const [componentSize, setComponentSize] = useState('default')
    const searchRef = useRef(null)
    const CheckedUserId = Number(KeyValue('PersonnelNo') ?? '0')
    const User = KeyValue('User') ?? '#'
    const usedByThird = id > '0' || id2 > '0'
    const notExist = useMemo(() => (error?.[0]?.indexOf('status code 404')) > -1, [error])

    const showModal = () => {

        form.resetFields()
        setType(['create', 'Create', '-1'])
        setOpen(true)

    }

    useEffect(() => {

        GetStatus({
            FilterField: 'Category',
            FilterValue: 'MaintenanceStatus',
        })

        usedByThird ? null : GetAssets({
            DepartmentId: Number(kv('department', ['1'])),
            FilterField: 'Serial',
            FilterValue: '',
        })

        tick.on((ms, value) => {

            tick.ms === 0 && console.log(value)

            tick.ms === 0 && GetAssets({
                DepartmentId: Number(kv('department', ['1'])),
                FilterField: 'Serial',
                FilterValue: value,
            })

        })

        event.on('popup.edit', (key) => {

            form.resetFields()
            setType(['update', `Update ${key}`, key])
            setOpen(true)
            GetItem(key)

        })

    }, [])

    useEffect(() => {

        if (data && !Array.isArray(data) && typeof data === 'object') {

            if (data.CheckedDate) data.CheckedDate = dayjs(data.CheckedDate)
            setAssetId(data.AssetId)
            form.setFieldsValue(data)

        }

    }, [form, data])

    useEffect(() => {

        form.resetFields()

        if (notExist && id > '0') {
            setType(['create', `Create ${id}`, id])
            GetAssets(id)
        }
        else if (id === '0') setType(['create', 'Create', '-1'])
        else if (id2 > '0') {
            setType(['update', `Update ${id2}`, id2])
            GetItem(id2)
        }
        else if (id > '0') {
            setType(['create', `Create ${id}`, id])
            GetAssets(id)
        }

    }, [id, id2, notExist])

    const onFormLayoutChange = ({ size }) => setComponentSize(size)
    const handleCancel = () => { setAssetId(0); setOpen(false); }
    const onSearch = (value) => tick.set(400, value)
    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    const handleOk = (data) => {

        if (data.ManufacturedDate) data.ManufacturedDate = dayjs(data.ManufacturedDate).format(df)
        if (data.StartedUsingDate) data.StartedUsingDate = dayjs(data.StartedUsingDate).format(df)

        const afterAction = (is) => {

            if (is === 'then') {
                setOpen(false)
                emit('AssetCheckHistories', `refetch`)
            }

        }

        console.log(data)

        type[0] === 'create' && SetItem({ ...data }, afterAction)
        type[0] === 'update' && PutItem(type[2], { Id: type[2], ...data }, afterAction)

    }

    const AssetsList = typeof Assets.data.Asset === 'undefined' && typeof Assets.data.Id === 'number' ? [Assets.data] : Assets.data.Asset ?? []

    useEffect(() => {

        if (AssetsList.length === 1 && AssetsList[0].Id) {
            form.setFieldsValue({ AssetId: AssetsList[0].Id })
            setAssetId(AssetsList[0].Id)
        }

    }, [AssetsList.length === 1 && AssetsList[0].Id])

    const Content = () => <Spin spinning={loading}>
        <Form
            form={form}
            size={'small'}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            initialValues={{ size: componentSize }}
            onValuesChange={onFormLayoutChange}
            style={{ maxWidth: 600 }}
            onFinish={handleOk}
        >
            <Divider />

            {/** *** *** *** *** *** *** **/}

            <Form.Item label="Asset" name="AssetId" rules={[{ required: true, message: 'Please enter AssetId!' }]}>
                <Select
                    loading={Assets.loading}
                    disabled={usedByThird}
                    autoClearSearchValue={false}
                    menuItemSelectedIcon={<SwapOutlined />}
                    ref={searchRef}
                    style={{ width: '100%' }}
                    showSearch
                    placeholder={'Asset Serial'}
                    optionFilterProp="children"
                    onSearch={onSearch}
                    onFocus={() => (Assets.data.Asset ?? []).length === 0 && onSearch('')}
                    onSelect={(e) => { setAssetId(e) }}
                    filterOption={filterOption}
                    options={(Assets.data.Asset ?? []).map(({ Id, TypeName, Rfid, Serial }) => ({
                        value: Id,
                        label: `${TypeName ?? Rfid} [${Serial}]`
                    }))}
                />
            </Form.Item>

            <Form.Item label="Status" name="Status" initialValue={'Active'}>
                <Select
                    style={{ width: '100%' }}
                    options={
                        Status.data.filter(({ Category, DepartmentId }) => Category === 'MaintenanceStatus' && DepartmentId === Number(kv('department', ['1']))).map(({ ConfigDesc, ConfigValue }) => ({
                            value: ConfigDesc,
                            label: ConfigDesc,
                        }))
                    }
                />
            </Form.Item>

            <Form.Item label="Description" name="Description">
                <TextArea
                    placeholder="Minimum and maximum number of lines"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </Form.Item>

            {typeof AssetId === 'number' && AssetId > 0 ?
                <Form.Item label="Image" initialValue={null}>
                    <Uploader AssetId={AssetId} />
                </Form.Item>
                : null}

            <Form.Item label="Checked User" initialValue={User}>
                <Input disabled={true} defaultValue={User} />
            </Form.Item>

            <Form.Item label="CheckedUserId" name="CheckedUserId" initialValue={CheckedUserId} hidden>
                <Input disabled={true} />
            </Form.Item>

            <Form.Item label="CheckedDate" name="CheckedDate" initialValue={dayjs()}>
                <DatePicker format={df} />
            </Form.Item>

            {/** *** *** *** *** *** *** **/}

            <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'right', marginBottom: 16 }}>
                <ErrorResponse error={[...set.error, ...put.error]} extra={<br />} />
                <Button size="medium" key="back" onClick={handleCancel} style={{ marginRight: 16 }}>Close</Button>
                <Button disabled={!myAccess()} icon={myAccess() ? null : <LockOutlined />} loading={set.loading || put.loading} size="medium" type="primary" htmlType="submit">Submit</Button>
            </Form.Item>

        </Form>
    </Spin>

    if (usedByThird) return <Content />

    return <>

        <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={showModal} />
        <Modal
            forceRender
            open={open}
            title={<>
                <RadiusUpleftOutlined style={{ color: '#1677ff' }} />
                <Text id="title" strong style={{ paddingLeft: 6 }}>{type[1]}</Text>
            </>}
            footer={null}
            onCancel={handleCancel}
        >
            <Content />
        </Modal >
    </>

}
