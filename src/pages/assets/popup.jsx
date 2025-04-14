import React, { useMemo, useState, useEffect, useRef } from 'react'
import { TagOutlined, PlusOutlined, ToolOutlined, LockOutlined, FileSearchOutlined } from '@ant-design/icons'
import { Modal, Button, DatePicker, Form, Input, Space, Select, Divider, Spin, Row, Col, Segmented, Tooltip, Badge } from 'antd'
import { useParams } from "react-router-dom"
import dayjs from 'dayjs'

import { Delay, KeyValue, ErrorResponse, kv, df, myAccess, use_description } from '../../common/utils'
import { countries } from '../../common/countries'
import { useBridge } from '../../hooks/bridge'

import RenderMaintenance from '../maintenance/popup'
import RenderInspection from '../maintenance/inspection/popup'

export const RenderForm = ({ geve, type, typeRef, setOpen, setSegment }) => {

    const [{ get: Types }, { get: GetTypes }] = useBridge({ url: 'DepartmentAssetTypes', get: [] })
    const [{ get: { loading, data }, set, put }, { get: GetItem, set: SetItem, put: PutItem, emit }] = useBridge({ url: 'Assets' })
    const [componentSize, setComponentSize] = useState('default')
    const [typeOpen, setTypeOpen] = useState(false)
    const [RFIDType, setRFIDType] = useState(kv('parser_version', ['0']) === '1')
    const rfidTemp = useRef('')
    const [form] = Form.useForm()
    let { id = 0 } = useParams()

    const [hash, setHash] = useState(location.hash)
    const desc = useMemo(() => use_description(hash.replace('#', '').replaceAll('_', ' ')), [hash])

    useEffect(() => {

        GetTypes({ departmentId: kv('department', [1]) }) // io.type_get(query ? `?${query}` : '')
        type[2] !== '-1' && GetItem(type[2]) // type[2] !== '-1' && io.item_get(type[2])

    }, [])

    useEffect(() => {

        if (loading === false && Types.loading === false) {

            Types.data.forEach(({ AssetTypeId, AssetTypeName }) => {
                data.AssetTypeId === AssetTypeId && setHash(AssetTypeName)
            })

        }

    }, [loading, Types.loading])

    useEffect(() => {

        const CardReaderAsset = (arg) => {

            const Rfid = arg?.data?.Rfid ?? null
            if (Rfid && typeof Rfid === 'string' && Rfid.indexOf(',') >= 0) {

                rfidTemp.current = Rfid
                let real = ''

                setRFIDType((cur) => { real = Rfid.split(',')[cur ? 0 : 1]; return cur; })
                Delay(() => form.setFieldsValue({ Rfid: real }), 10)

            }

        }

        const CardReaderPerson = (e) => form.setFieldsValue({ Rfid: e.key })

        geve.on('asset-reader', CardReaderAsset)
        geve.on('person-reader', CardReaderPerson)
        return () => {
            geve.off('asset-reader', CardReaderAsset)
            geve.off('person-reader', CardReaderPerson)
        }

    }, [])

    useEffect(() => {

        kv('parser_version', RFIDType ? '1' : '0')
        form.setFieldsValue({ Rfid: rfidTemp.current.split(',')[RFIDType ? 0 : 1] })

    }, [RFIDType])

    useEffect(() => {

        if (data && !Array.isArray(data) && typeof data === 'object') {

            if (data.ManufacturedDate) data.ManufacturedDate = dayjs(data.ManufacturedDate)
            if (data.StartedUsingDate) data.StartedUsingDate = dayjs(data.StartedUsingDate)
            form.setFieldsValue(data)

        }

    }, [form, data])

    const onFormLayoutChange = ({ size }) => setComponentSize(size)
    const handleOk = (data) => {

        if (data.ManufacturedDate) data.ManufacturedDate = dayjs(data.ManufacturedDate).format(df)
        if (data.StartedUsingDate) data.StartedUsingDate = dayjs(data.StartedUsingDate).format(df)

        data.ModifiedUserId = Number(KeyValue('PersonnelNo') ?? '0')
        data.DepartmentId = Number(KeyValue('department') ?? '1')

        const afterAction = (is) => {

            if (is === 'then') {
                setOpen(false)
                emit('Assets', `refetch`)
            }

        }

        type[0] === 'create' && SetItem({ ...data }, afterAction)
        type[0] === 'update' && PutItem(type[2], { Id: type[2], ...data }, afterAction)

    }

    return <Spin spinning={loading}>
        <Form
            form={form}
            size={'small'}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            initialValues={{
                size: componentSize,
                AssetTypeId: Number(id),
                // ManufacturedDate: dayjs,
                // Country: 'Mongolia (MN)'
            }}
            onValuesChange={onFormLayoutChange}
            style={{ maxWidth: 600 }}
            onFinish={handleOk}
        >
            <Divider />

            <Form.Item label="Type" name={'AssetTypeId'}>
                <Select
                    disabled={false}
                    showSearch={true}
                    loading={Types.loading}
                    placeholder={'Please select type'}
                    open={typeOpen}
                    onDropdownVisibleChange={(visible) => setTypeOpen(visible)}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().indexOf((input ?? '').toLowerCase()) !== -1}
                    options={(Types.data ?? []).filter(({ AssetTypeName }) => AssetTypeName[0] !== '-').map(({ Id, AssetTypeId, AssetTypeName }) => ({ value: AssetTypeId, label: AssetTypeName }))}
                    onSelect={(id, { label }) => setHash(label)}
                    dropdownRender={(menu) => (
                        <>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <Space style={{ padding: '0 8px 4px' }}>
                                <Input disabled ref={typeRef} placeholder="Please enter name" onPressEnter={() => { setSegment('Type'); setTypeOpen(false); }} />
                                <Button disabled type="text" icon={<PlusOutlined />} onClick={() => { setSegment('Type'); setTypeOpen(false); }}>Add type</Button>
                            </Space>
                        </>
                    )}
                />
            </Form.Item>

            {desc !== null ? <Form.Item label="Description" name="Description">
                {desc.v[0] === '[TEXT]' ? <Input /> : null}
                {desc.v[0] === '[SELECT]' ? <Segmented size='small' options={desc.v[1].map((e, i) => ({ label: <Badge color={desc.c[1][i] === 'default' ? 'grey' : desc.c[1][i]} text={e} />, value: e }))} /> : null}
            </Form.Item> : null}

            <Form.Item label="RFID" name="Rfid" rules={[{ required: true, message: 'Please input RFID!' }]}>
                <Input
                    suffix={
                        <Tooltip title={RFIDType ? "Parser: v01" : "Parser: v02"}>
                            <Button type="link" size={'small'} onClick={() => setRFIDType((e) => !e)} style={{ paddingRight: 0 }}>
                                {RFIDType ? "v01" : "v02"}
                            </Button>
                        </Tooltip>
                    }
                />
            </Form.Item>

            <Form.Item label={desc !== null ? "DSRC MAC" : "Serial"} name="Serial" rules={[{ required: true, message: 'Please input Serial!' }]}>
                <Input />
            </Form.Item>

            {desc !== null ? <Form.Item label="WIFI MAC" name="Mac2" rules={[{ required: false, message: 'Please input Serial!' }]}>
                <Input />
            </Form.Item> : null}

            {/* <Form.Item label="Mfg. Country" name='Country'>
                <Select
                    disabled={true}
                    showSearch={true}
                    placeholder={'Please select country'}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().indexOf((input ?? '').toLowerCase()) !== -1}
                    options={(countries ?? []).map(({ name, code }) => ({ value: name, label: `${name} (${code})` }))}
                />
            </Form.Item> */}

            <Form.Item label="Mfg. Date" name="ManufacturedDate">
                <DatePicker format={df} />
            </Form.Item>

            <Form.Item label="Date started using" name='StartedUsingDate'>
                <DatePicker format={df} />
            </Form.Item>

            {/** Just for keeping the values **/}
            <Form.Item hidden label="LastMaintenanceId" name="LastMaintenanceId"><Input /></Form.Item>

            <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'right', marginBottom: 2 }}>
                <ErrorResponse error={[...set.error, ...put.error]} extra={<br />} />
                <Button size="medium" key="back" onClick={() => setOpen(false)} style={{ marginRight: 16 }}>Close</Button>
                <Button disabled={!myAccess()} icon={myAccess() ? null : <LockOutlined />} loading={set.loading || put.loading} size="medium" type="primary" htmlType="submit">Submit</Button>
            </Form.Item>

        </Form>
    </Spin>
}

export default ({ geve, event, io, pRef, defSegment = 'Asset' }) => {

    const [{ }, { emit }] = useBridge({ url: '' })
    const [open, setOpen] = useState(false)
    const [segment, setSegment] = useState(defSegment)
    const [type, setType] = useState(['', '', '', ''])
    const typeRef = useRef()

    useEffect(() => {

        event.on('assets.popup.create', () => {
            setSegment('Asset')
            setType(['create', 'Create asset', '-1', '0'])
            setOpen(true)
        })

        event.on('assets.popup.edit', ([key, id]) => {

            setSegment('Asset')
            setType(['update', `Update asset ${key}`, key, id])
            setOpen(true)
        })

    }, [])

    return <>

        <Button ref={pRef} type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => event.emit('assets.popup.create', true)} />

        <Modal
            forceRender={false}
            destroyOnClose={true} /** Need to close all the events **/
            open={open}
            footer={null}
            onCancel={() => {
                setOpen(false)
                emit('Assets', 'refetch')
            }}
            title={
                <Segmented
                    value={segment}
                    onChange={(v) => setSegment(v)}
                    options={[
                        { label: 'Asset', value: 'Asset', icon: <TagOutlined /> },
                        type[0] === 'update' ? { label: 'Maintenance', value: 'Maintenance', icon: <ToolOutlined />, disabled: type[0] === 'create' } : null,
                        type[0] === 'update' ? { label: 'Inspection', value: 'Inspection', icon: <FileSearchOutlined />, disabled: type[0] === 'create' } : null,
                    ].filter(e => e !== null)}
                />
            }
        >

            <Row>

                {segment === 'Asset' ? (
                    <Col span={24} style={{ display: segment === 'Asset' ? 'block' : 'none' }}>
                        <RenderForm geve={geve} typeRef={typeRef} type={type} io={io} event={event} pRef={pRef} isOpen={open} setOpen={setOpen} setSegment={setSegment} />
                    </Col>
                ) : null}

                {segment === 'Maintenance' ? (
                    <Col span={24} style={{ display: segment === 'Maintenance' ? 'block' : 'none' }}>
                        <RenderMaintenance event={event} id={type[2]} id2={type[3]} />
                    </Col>
                ) : null}

                {segment === 'Inspection' ? (
                    <Col span={24} style={{ display: segment === 'Inspection' ? 'block' : 'none' }}>
                        <RenderInspection event={event} args={{ type: 'Create', key: type[2] }} />
                    </Col>
                ) : null}

            </Row>

        </Modal>

    </>

}