import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Modal, Form, Col, Row, Divider, Space, theme } from 'antd'
import { DatePicker, Segmented, Button, Select, Input, InputNumber, Switch, Spin, Result } from 'antd'
import { PlusOutlined, MinusCircleOutlined, FormOutlined, PlusSquareOutlined, LockOutlined, LoadingOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'

import { Helmet, Gloves, Key, Vest, Spray, Bottle, Glass, Lock, Respirator } from '../../svgs'
import { ErrorResponse, Delay, myAccess, kv, nested, df, inspection_list, myDeps, access_level } from '../../utils'
import { useBridge } from '../../../hooks/bridge'

import dayjs from 'dayjs'

const { useToken } = theme
const on = <CheckOutlined />
const off = <CloseOutlined />

/** *** *** *** [ ASSET TYPE ] *** *** *** **/

export const AssetTypes = ({ id, mode }) => {

    const lvl = useMemo(() => access_level(), [])
    const [form] = Form.useForm()

    const [{ set: _set, put: _put }, { set, put }] = useBridge({ url: 'AssetTypes' })
    const [{ get: type }, { get: getType }] = useBridge({ url: 'AssetTypes', get: [] })
    const [{ get: types }, { get: getTypes }] = useBridge({ url: 'AssetTypes', get: [] })
    const [{ get: departments }, { get: getDepartments }] = useBridge({ url: 'Departments', get: [] })
    const [{ get: qualifications }, { get: getQualifications }] = useBridge({ url: 'Qualifications/GetAllQualifications' })

    const [visualCheck, setVisualCheck] = useState(false)
    const [pressureTest, setPressureTest] = useState(false)
    const [calibration, setCalibration] = useState(false)
    const [Enabled, setEnabled] = useState(true)

    const iInspection = kv('iInspection', ['On']) === 'On'
    const deps = useMemo(() => myDeps(), [])

    const resetFields = () => {
        setVisualCheck(false)
        setPressureTest(false)
        setCalibration(false)
        form.resetFields()
    }

    useEffect(() => {

        Delay(() => {

            getDepartments({})
            getQualifications({})

        }, 250)

    }, [])

    useEffect(() => {

        resetFields()

        mode === 'Update' && getTypes({ DepartmentId: kv('department', ['1']) })
        mode === 'Update' && id !== -1 && getType(id)

    }, [mode, id])

    useEffect(() => {

        if (type.loading === true) resetFields()

        if (type.loading === true || typeof type.data !== 'object' || Object.keys(type.data).length === 0) return

        const p = { ...type.data }

        p.DepartmentAssetTypes = p.DepartmentAssetTypes?.map(({ DepartmentId }) => `${DepartmentId}`) ?? []
        p.TypeTrainings = p.TypeTrainings?.map(({ TrainingId }) => `${TrainingId}`) ?? []

        const inspection_obj = {}
        inspection_list.forEach((k) => {
            const [id, name] = k.split('.')
            inspection_obj[id] = name
        })

        if (p.AssetCheckTypeSettings.length === 0) { } else {

            const { Expirelimit, CheckNear, ExpireNear } = p.AssetCheckTypeSettings[0] ?? {}

            p.Expire = {
                Count: Expirelimit,
                Period: ExpireNear ? `${ExpireNear}` : undefined,
                // Attention: ExpireNear ? `${ExpireNear}` : undefined,
            }

            for (const x of p.AssetCheckTypeSettings) {

                const name = inspection_obj[x.CheckTypeId]

                if (x.StartDate) x.StartDate = dayjs(x.StartDate)

                if (name === 'VisualCheck') setVisualCheck(x.Enabled === 1 || x.Enabled === '1')
                if (name === 'PressureTest') setPressureTest(x.Enabled === 1 || x.Enabled === '1')
                if (name === 'Calibration') setCalibration(x.Enabled === 1 || x.Enabled === '1')

                p[name] = x

            }

        }

        form.setFieldsValue({ ...p })
        const name = p.Name
        if (typeof name === 'string' && name.length > 0 && name[0] !== '-') setEnabled(true)
        if (typeof name === 'string' && name.length > 0 && name[0] === '-') setEnabled(false)

    }, [type.loading])

    useEffect(() => {

        const name = form.getFieldValue('Name')

        if (typeof name === 'string' && name.length > 0) {

            if (Enabled && name[0] === '-') form.setFieldValue('Name', name.replace('-', ''))
            if (!Enabled && name[0] !== '-') form.setFieldValue('Name', `-${name}`)

        }

    }, [Enabled])

    const onSubmit = () => form.validateFields().then((e) => {

        const ls = [];

        const { Expire: { Count = 0, Period = '', Attention = '' } } = e

        inspection_list.forEach((k) => {

            const [id, name] = k.split('.')

            if (nested(e, [name])) {

                e[name].CheckTypeId = id
                /** *** *** *** **/
                e[name].ExpireLimit = Count
                // e[name].Period = Date
                e[name].ExpireNear = `${Period}`
                e[name].CheckNear = `${e[name].CheckNear}`

                if (name === 'VisualCheck') e[name].Enabled = visualCheck ? '1' : '0'
                if (name === 'PressureTest') e[name].Enabled = pressureTest ? '1' : '0'
                if (name === 'Calibration') e[name].Enabled = calibration ? '1' : '0'
            }

            if (nested(e, [name, 'StartDate'])) e[name].StartDate = dayjs(e[name].StartDate).format(df)

            ls.push(e[name])

        })

        e.AssetCheckTypeSettings = ls
        e.DepartmentAssetTypes = e.DepartmentAssetTypes?.map(id => ({ DepartmentId: Number(id) })) ?? []
        e.TypeTrainings = e.TypeTrainings?.map(id => ({ TrainingId: Number(id), Type: 'Returnable' })) ?? []

        mode === 'Create' && set(e, (is) => is === 'then' && resetFields())
        mode === 'Update' && put(e.Id, e, (is) => is === 'then' && resetFields())

    }).catch(console.log)

    return <Spin spinning={type.loading} delay={0} indicator={<LoadingOutlined />} >
        <Form.Provider>

            <Form
                form={form}
                size={'small'}
                layout="horizontal"
                labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
                wrapperCol={{ xs: { span: 24 }, sm: { span: 15 } }}
            >

                {mode === 'Update' ? <Form.Item name={'Id'} label="Select" rules={[{ required: true, message: 'Please select type!' }]}>
                    <Select
                        placeholder="Select type"
                        loading={types.loading}
                        status={types.error.length > 0 ? "error" : null}
                        disabled={types.error.length > 0 || types.loading}
                        options={types.data.map(({ Id, Name }) => ({ value: `${Id}`, label: <span style={{ textDecoration: Name[0] === '-' ? "line-through" : "auto" }}>{Name[0] === '-' ? Name.replace('-', '') : Name}</span> }))}
                        onChange={(value) => getType(Number(value))}
                    />
                </Form.Item> : null}

                <Form.Item name={'Name'} label="Name" rules={[{ required: true, message: 'Please enter name!' }]}>
                    <Input
                        placeholder='Enter name'
                        maxLength={64}
                        showCount
                    />
                </Form.Item>

                <Form.Item name={'DepartmentAssetTypes'} label="Departments" rules={[{ required: true, message: 'Please select departments!' }]}>
                    <Select
                        mode="multiple"
                        placeholder="Select departments"
                        loading={departments.loading}
                        status={departments.error.length > 0 ? "error" : null}
                        disabled={departments.error.length > 0 || departments.loading}
                        options={departments.data.map(({ Id, Name }) => ({
                            value: `${Id}`,
                            label: Name,
                            disabled: !deps.includes(Number(Id))
                        }))}
                    />
                </Form.Item>

                <Form.Item name={'TypeTrainings'} label="Trainings">
                    <Select
                        mode="multiple"
                        placeholder="Select trainings"
                        loading={qualifications.loading}
                        status={qualifications.error.length > 0 ? "error" : null}
                        disabled={qualifications.error.length > 0 || qualifications.loading}
                        optionFilterProp="label"
                        options={qualifications.data?.Qualification?.map(({ QualificationCode, QualificationDesc }) => ({
                            value: `${QualificationCode}`,
                            label: `${QualificationCode}: ${QualificationDesc}`,
                        }))}
                    />
                </Form.Item>

                <Form.Item label={'Expire'}>

                    <Space.Compact block>

                        <Form.Item name={['Expire', 'Count']} style={{ width: '40%', marginBottom: 0 }}>
                            <InputNumber
                                placeholder='Expire count'
                                maxLength={3}
                                addonAfter="count"
                            />
                        </Form.Item>

                        <Form.Item name={['Expire', 'Period']} style={{ width: '30%', marginBottom: 0 }}>
                            <Select placeholder="Period">
                                <Select.Option value="3">3 months</Select.Option>
                                <Select.Option value="6">6 months</Select.Option>
                                <Select.Option value="12">12 months</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['Expire', 'Attention']} style={{ width: '30%', marginBottom: 0 }}>
                            <Select disabled placeholder="Day">
                                <Select.Option value="1">1 day</Select.Option>
                                <Select.Option value="2">2 days</Select.Option>
                                <Select.Option value="3">3 days</Select.Option>
                            </Select>
                        </Form.Item>

                    </Space.Compact>

                </Form.Item>

                <Form.Item name={'VisualCheck'} label={<Switch value={visualCheck} disabled={iInspection === false} onChange={(e) => setVisualCheck(e)} size="default" checkedChildren="Visual Check" unCheckedChildren="Visual check" />}>

                    <Space.Compact block>

                        <Form.Item hidden name={['VisualCheck', 'Id']} initialValue={0}><Input /></Form.Item>

                        <Form.Item name={['VisualCheck', 'CheckPeriod']} style={{ width: '30%', marginBottom: 0 }} rules={[{ required: visualCheck }]} >
                            <Select placeholder="Period" disabled={!iInspection || !visualCheck}>
                                <Select.Option value={3}>3 months</Select.Option>
                                <Select.Option value={6}>6 months</Select.Option>
                                <Select.Option value={12}>12 months</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['VisualCheck', 'CheckNear']} style={{ width: '30%', marginBottom: 0 }} rules={[{ required: visualCheck }]} >
                            <Select placeholder="Alert" disabled={!iInspection || !visualCheck}>
                                <Select.Option value={1}>1 day</Select.Option>
                                <Select.Option value={2}>2 days</Select.Option>
                                <Select.Option value={3}>3 days</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['VisualCheck', 'StartDate']} style={{ width: '40%', marginBottom: 0 }} rules={[{ required: visualCheck }]}  >
                            <DatePicker disabled={!iInspection || !visualCheck} placeholder='Start' />
                        </Form.Item>

                    </Space.Compact>

                </Form.Item>

                <Form.Item name={'PressureTest'} label={<Switch value={pressureTest} disabled={iInspection === false} onChange={(e) => setPressureTest(e)} size="default" checkedChildren="Pressure Test" unCheckedChildren="Pressure Test" />}>

                    <Space.Compact block>

                        <Form.Item hidden name={['PressureTest', 'Id']} initialValue={0}><Input /></Form.Item>

                        <Form.Item name={['PressureTest', 'CheckPeriod']} style={{ width: '30%', marginBottom: 0 }} rules={[{ required: pressureTest }]}  >
                            <Select placeholder="Period" disabled={!iInspection || !pressureTest}>
                                <Select.Option value={3}>3 months</Select.Option>
                                <Select.Option value={6}>6 months</Select.Option>
                                <Select.Option value={12}>12 months</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['PressureTest', 'CheckNear']} style={{ width: '30%', marginBottom: 0 }} rules={[{ required: pressureTest }]}  >
                            <Select placeholder="Alert" disabled={!iInspection || !pressureTest}>
                                <Select.Option value={1}>1 day</Select.Option>
                                <Select.Option value={2}>2 days</Select.Option>
                                <Select.Option value={3}>3 days</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['PressureTest', 'StartDate']} style={{ width: '40%', marginBottom: 0 }} rules={[{ required: pressureTest }]}  >
                            <DatePicker disabled={!iInspection || !pressureTest} placeholder='Start' />
                        </Form.Item>

                    </Space.Compact>

                </Form.Item>

                <Form.Item name={'Calibration'} label={<Switch value={calibration} disabled={iInspection === false} onChange={(e) => setCalibration(e)} size="default" checkedChildren="Calibration" unCheckedChildren="Calibration" />}>

                    <Space.Compact block>

                        <Form.Item hidden name={['Calibration', 'Id']} initialValue={0}><Input /></Form.Item>

                        <Form.Item name={['Calibration', 'CheckPeriod']} style={{ width: '30%', marginBottom: 0 }} rules={[{ required: calibration }]} >
                            <Select placeholder="Period" disabled={!iInspection || !calibration}>
                                <Select.Option value={3}>3 months</Select.Option>
                                <Select.Option value={6}>6 months</Select.Option>
                                <Select.Option value={12}>12 months</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['Calibration', 'CheckNear']} style={{ width: '30%', marginBottom: 0 }} rules={[{ required: calibration }]} >
                            <Select placeholder="Alert" disabled={!iInspection || !calibration}>
                                <Select.Option value={1}>1 day</Select.Option>
                                <Select.Option value={2}>2 days</Select.Option>
                                <Select.Option value={3}>3 days</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name={['Calibration', 'StartDate']} style={{ width: '40%', marginBottom: 0 }} rules={[{ required: calibration }]} >
                            <DatePicker disabled={!iInspection || !calibration} placeholder='Start' />
                        </Form.Item>

                    </Space.Compact>

                </Form.Item>

                <Form.Item label="Enabled">
                    <Switch value={Enabled} onChange={(e) => setEnabled(e)} checkedChildren={on} unCheckedChildren={off} size="default" />
                </Form.Item>

            </Form>

            <ErrorResponse error={_set.error ?? _put.error ?? type.error} extra={<br />} />

            <Row justify={'end'}>
                <Col span={21} style={{ textAlign: 'right' }}>
                    {mode === 'Update' ? (<Button icon={lvl > 2 ? <LockOutlined /> : null} danger disabled={lvl > 2} size="medium" onClick={() => { }} style={{ marginRight: 16 }}>Delete</Button>) : null}
                    <Button disabled={lvl > 2} icon={lvl > 2 ? <LockOutlined /> : null} loading={_set.loading || _put.loading} onClick={() => onSubmit()} size="medium" type="primary">{mode}</Button>
                </Col>
                <Col span={3}></Col>
            </Row>

        </Form.Provider>
    </Spin>

}

/** *** *** *** [ SPECIAL TYPE ] *** *** *** **/

export const SpecialTypes = ({ mode }) => {

    const lvl = useMemo(() => access_level(), [])
    const [assetTypes, { set, put }] = useBridge({ url: 'NonReturnableAssetTypes' })
    const [{ get: type }, { get: getType }] = useBridge({ url: 'NonReturnableAssetTypes' })
    const [{ get: types }, { get: getTypes }] = useBridge({ url: 'NonReturnableAssetTypes' })
    const [{ get: departments }, { get: getDepartments }] = useBridge({ url: 'Departments', get: [] })
    const [{ get: qualifications }, { get: getQualifications }] = useBridge({ url: 'Qualifications/GetAllQualifications' })

    const { token } = useToken()
    const [form] = Form.useForm()
    const [typeName, setTypeName] = useState('')
    const [typeDeps, setTypeDeps] = useState([])
    const [typeCode, setTypeCode] = useState({})
    const [Enabled, setEnabled] = useState(true)

    useEffect(() => {

        getTypes({})

        Delay(() => {

            getDepartments({})
            getQualifications({})

        }, 250)

    }, [])

    useEffect(() => {

        if (type.loading === true || typeof type.data !== 'object' || Object.keys(type.data).length === 0) return
        const p = { ...type.data }
        p.TypeTrainings = p.TypeTrainings?.map(({ TrainingId }) => `${TrainingId}`) ?? []
        // p.Departments = p.Departments.map(({ DepartmentId }) => `${DepartmentId}`) /** API not implemented **/
        form.setFieldsValue({ ...p })

        const name = p.Name
        if (typeof name === 'string' && name.length > 0 && name[0] !== '-') setEnabled(true)
        if (typeof name === 'string' && name.length > 0 && name[0] === '-') setEnabled(false)

    }, [type.loading])

    useEffect(() => {

        const name = form.getFieldValue('Name')

        if (typeof name === 'string' && name.length > 0) {

            if (Enabled && name[0] === '-') form.setFieldValue('Name', name.replace('-', ''))
            if (!Enabled && name[0] !== '-') form.setFieldValue('Name', `-${name}`)

        }

    }, [Enabled])

    const setCustom = (k, v) => {

        const prev = form.getFieldValue('NonReturnableAssetFields')
        if (typeof prev[k] === 'undefined') prev[k] = {}
        prev[k].ValueType = v
        form.setFieldValue('NonReturnableAssetFields', prev)
        setTypeCode((c) => { const z = {}; z[k] = v; return { ...c, ...z } })

    }

    const onSubmit = () => form.validateFields().then((e) => {

        e.TypeTrainings = e.TypeTrainings?.map(id => ({ TrainingId: Number(id), Type: 'NonReturnable' })) ?? []
        if (!Array.isArray(e.NonReturnableAssetFields)) e.NonReturnableAssetFields = []

        /** Must be removed **/
        /* mode === 'Create' && e.NonReturnableAssetFields.push({ FieldName: '_CooldownDays', ValueType: `${e.CooldownDays ?? ''}` })
        mode === 'Create' && e.NonReturnableAssetFields.push({ FieldName: '_Limit', ValueType: `${e.Limit ?? ''}` }) */

        mode === 'Create' && set(e, (is) => is === 'then' && form.resetFields())
        mode === 'Update' && put(e.Id, e, (is) => is === 'then' && form.resetFields())

    }).catch(console.log)

    const enable = (is, idx) => {

        const vals = form.getFieldValue('NonReturnableAssetFields')
        const sym = vals[idx]['FieldName'][0] === '-'

        if (is && sym) vals[idx]['FieldName'] = vals[idx]['FieldName'].replace('-', '')
        if (!is && !sym) vals[idx]['FieldName'] = `-${vals[idx]['FieldName']}`

        form.setFieldValue('NonReturnableAssetFields', vals)

    }

    const isEnabled = (idx) => {

        const vals = form.getFieldValue('NonReturnableAssetFields')
        return vals[idx]?.['FieldName'][0] === '-' ? false : true

    }

    return <Form.Provider>

        <Form
            form={form}
            name="main_fields"
            size={'small'}
            layout="horizontal"
            labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 15 } }}
        >

            {mode === 'Update' ? <Form.Item name={'Id'} label="Select" rules={[{ required: true, message: 'Please select type!' }]}>
                <Select
                    placeholder="Select type"
                    loading={types.loading}
                    status={types.error.length > 0 ? "error" : null}
                    disabled={types.error.length > 0 || types.loading}
                    options={types.data?.AssetAllocation?.map(({ Id, Name }) => ({ value: `${Id}`, label: <span style={{ textDecoration: Name[0] === '-' ? "line-through" : "auto" }}>{Name[0] === '-' ? Name.replace('-', '') : Name}</span> }))}
                    onChange={(value) => {
                        form.resetFields()
                        getType(Number(value))
                    }}
                />
            </Form.Item> : null}

            <Form.Item name={'Name'} label="Name" rules={[{ required: true, message: 'Please enter name!' }]}>

                <Input
                    value={typeName}
                    onChange={(e) => { setTypeName(e.target.value) }}
                    placeholder='Enter name'
                    maxLength={64}
                    showCount
                />

            </Form.Item>

            <Form.Item name={'IconName'} label="Icon">
                <Segmented
                    options={[
                        { value: 'Helmet', icon: <Helmet color={token.colorText} size={14} /> },
                        // { value: 'Mask', icon: <Mask color={token.colorText} size={14} /> },
                        { value: 'Gloves', icon: <Gloves color={token.colorText} size={14} /> },
                        { value: 'Key', icon: <Key color={token.colorText} size={14} /> },
                        { value: 'Vest', icon: <Vest color={token.colorText} size={14} /> },
                        // { value: 'Thermometer', icon: <Thermometer color={token.colorText} size={14} /> },
                        // { value: 'Gauge', icon: <Gauge color={token.colorText} size={14} /> },
                        // { value: 'Tag', icon: <Tag color={token.colorText} size={14} /> },
                        { value: 'Spray', icon: <Spray color={token.colorText} size={14} /> },
                        { value: 'Bottle', icon: <Bottle color={token.colorText} size={14} /> },
                        { value: 'Glass', icon: <Glass color={token.colorText} size={14} /> },
                        { value: 'Lock', icon: <Lock color={token.colorText} size={14} /> },
                        { value: 'Respirator', icon: <Respirator color={token.colorText} size={14} /> },
                    ]}
                />
            </Form.Item>

            <Form.Item name='CooldownDays' label="Interval">
                <InputNumber
                    placeholder='Cooldown Days'
                    maxLength={3}
                    addonAfter="days"
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item name='Limit' label="Limit">
                <InputNumber
                    placeholder='Limit'
                    maxLength={3}
                    addonAfter="count"
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item name={'Departments'} label="Departments" rules={[ /* { required: true, message: 'Please select departments!' } */]}>
                <Select
                    disabled
                    mode="multiple"
                    placeholder="Select departments"
                    onChange={(vals) => { setTypeDeps(vals.map(n => ({ DepartmentId: Number(n) }))) }}
                    loading={departments.loading}
                    options={departments.data.map(({ Id, Name }) => ({ value: `${Id}`, label: Name }))}
                />
            </Form.Item>

            <Form.Item name={'TypeTrainings'} label="Trainings">
                <Select
                    mode="multiple"
                    placeholder="Select trainings"
                    onChange={(vals) => { setTypeDeps(vals.map(n => ({ DepartmentId: Number(n) }))) }}
                    loading={departments.loading}
                    optionFilterProp="label"
                    options={qualifications.data?.Qualification?.map(({ QualificationCode, QualificationDesc }) => ({
                        value: `${QualificationCode}`,
                        label: `${QualificationCode}: ${QualificationDesc}`,
                    }))}
                />
            </Form.Item>

        </Form>

        <Row>
            <Col span={6}></Col>
            <Col span={15}>

                <Form
                    form={form}
                    name="custom_fields"
                    layout="horizontal"
                    autoComplete="off"
                    size={'small'}
                >
                    <Form.List name="NonReturnableAssetFields">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={`cf_${key}`} style={{ display: 'flex', marginBottom: 0 }} align="baseline">

                                        <Form.Item name={[name, 'FieldName']} rules={[{ required: true, message: 'Missing field' }]} style={{ marginBottom: 20 }} {...restField}>
                                            <Input placeholder="Field name" />
                                        </Form.Item>

                                        <Form.Item name={[name, 'ValueType']} rules={[{ required: true, message: 'Missing value' }]} style={{ position: 'relative', top: -1, marginBottom: 20 }} {...restField}>

                                            <Input disabled={typeCode[key]} placeholder={'Field value'} name={[name, 'ValueCode']} addonAfter={
                                                <Select onChange={(e) => setCustom(key, e)} defaultValue={typeCode[key] ?? ''} style={{ width: 75 }}>
                                                    <Select.Option value="">Select</Select.Option>
                                                    <Select.Option value="[CHECK]">Check</Select.Option>
                                                    <Select.Option value="[DATE]">Date</Select.Option>
                                                    <Select.Option value="[TEXT]">Text</Select.Option>
                                                </Select>
                                            } />

                                        </Form.Item>

                                        {mode === 'Create' ?
                                            <MinusCircleOutlined onClick={() => remove(name)} /> :
                                            <Switch size={'small'} defaultChecked={isEnabled(name)} onChange={(e) => enable(e, name)} checkedChildren={on} unCheckedChildren={off} />}

                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add field</Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                </Form>

            </Col>
        </Row>

        <Form
            size={'small'}
            layout="horizontal"
            labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 15 } }}
        >
            <Form.Item label="Enabled">
                <Switch value={Enabled} onChange={(e) => setEnabled(e)} checkedChildren={on} unCheckedChildren={off} size="default" />
            </Form.Item>
        </Form>

        <ErrorResponse error={assetTypes.set.error ?? assetTypes.put.error} extra={<br />} />

        <Row justify={'end'}>
            <Col span={21} style={{ textAlign: 'right' }}>
                {mode === 'Update' ? (<Button danger icon={lvl > 2 ? <LockOutlined /> : null} disabled={lvl > 2} size="medium" onClick={() => { }} style={{ marginRight: 16 }}>Delete</Button>) : null}
                <Button disabled={lvl > 2} icon={lvl > 2 ? <LockOutlined /> : null} loading={assetTypes.set.loading || assetTypes.put.loading} onClick={() => onSubmit()} size="medium" type="primary">{mode}</Button>
            </Col>
            <Col span={3}></Col>
        </Row>

    </Form.Provider >

}

/** *** *** *** [ ENUM TYPE writes to CONFIGURATION TABLE ] *** *** *** **/

export const EnumTypes = ({ mode }) => {

    const lvl = useMemo(() => access_level(), [])

    if (lvl > 2) return <Result
        style={{ padding: '0px 0px 16px ' }}
        status="403"
        subTitle="You are not authorized to perform this operation"
    />

    const [{ get, set, put }, { get: _get, set: _set, put: _put }] = useBridge({ url: 'Configuration', get: [] })
    const [{ get: Departments }, { get: getDepartments }] = useBridge({ url: 'Departments', get: [] })

    const [form] = Form.useForm()

    const [Type, setType] = useState('')
    const [Enabled, setEnabled] = useState(false)

    const updateSelection = useRef({})
    const [updateKV, setUpdateKV] = useState([])

    /** Update Special item(s) **/
    const [items, setItems] = useState([])

    useEffect(() => { Delay(() => getDepartments({}), 250) }, [])
    useEffect(() => { mode === 'Update' && _get({ departmentId: kv('department', ['1']) }) }, [mode])
    useEffect(() => {

        if (get.data.length === 0) return

        const _ = {}

        for (const e of get.data) {

            if (!_.hasOwnProperty(e.Category)) _[e.Category] = []
            _[e.Category].push(e)

        }

        let _items = []

        for (const x in _) _items.push({ value: x, label: x })

        updateSelection.current = _
        setItems(_items)

    }, [get.loading])

    const format = (from = {}, dir = 'form_to_api', t = 'post') => {

        if (dir === 'form_to_api') return {
            ...(from.hasOwnProperty('Id') ? { ConfigId: from.Id } : {}),
            "Category": from.Type ?? from.select_1,
            "ConfigDesc": from.Name,
            "ConfigValue": from.Value,
            "DepartmentId": t === 'post' ? [Number(from.Departments)] : Number(from.Departments),
            "IsEnabled": from.Enabled === true ? 1 : 0,
        }
        else return {
            "Type": from.Category,
            "Name ": from.ConfigDesc,
            "Value": from.ConfigValue,
            "Departments": `${from.DepartmentId}`,
            "Enabled": from.IsEnabled === 1,
        }

    }

    const onSubmit = () => form.validateFields().then((e) => {

        mode === 'Create' && _set(format(e, 'form_to_api', 'post'), (is) => is === 'then' && _get('refetch', (is) => form.resetFields()))
        if (mode === 'Update') {
            const body = format(e, 'form_to_api', 'put')
            _put(body.ConfigId, body, (is) => is === 'then' && _get('refetch', (is) => form.resetFields()))
        }

    }).catch(console.log)

    const onUpdateChange = (name) => setUpdateKV(updateSelection.current[name] ?? [])

    const onUpdateNameChange = (val, args) => {

        const ls = updateSelection.current ?? {}

        if (ls.hasOwnProperty(args.Category)) {

            for (const x of ls[args.Category]) {
                if (x.ConfigId === val) {

                    form.setFieldsValue({
                        "Id": x.ConfigId,
                        "Type": x.Category,
                        "Name": x.ConfigDesc,
                        "Value": x.ConfigValue,
                        "Departments": `${x.DepartmentId}`,
                        "Enabled": x.IsEnabled === 1,
                    })

                }
            }

        }

    }

    return <Form.Provider >

        <Form
            form={form}
            name="main_fields"
            size={'small'}
            layout="horizontal"
            labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 15 } }}
        >

            {mode === 'Create' ? <>

                <Form.Item name={'Type'} label="Type" rules={[{ required: true, message: 'Please enter type!' }]}>
                    <Input
                        value={Type}
                        onChange={(e) => { setType(e.target.value) }}
                        placeholder='Enter type'
                        maxLength={64}
                        showCount
                    />
                </Form.Item>

            </> : <>

                {mode === 'Update' ? <Form.Item hidden name={'Id'} label="Id" rules={[{ required: true, message: 'Please select type!' }]}><Input /></Form.Item> : null}

                {mode === 'Update' ? <Form.Item name={'select_1'} label="Type" rules={[{ required: true, message: 'Please select type!' }]}>
                    <Select
                        placeholder="Select type"
                        loading={get.loading}
                        status={get.error.length > 0 ? "error" : null}
                        disabled={get.error.length > 0 || get.loading}
                        options={items.map(({ value, label }) => ({ value, label }))}
                        onChange={onUpdateChange}
                    />
                </Form.Item> : null}

                {mode === 'Update' ? <Form.Item name={'select_2'} label="Name / Value" rules={[{ required: true, message: 'Please select name!' }]}>
                    <Select
                        placeholder="Select name"
                        status={updateKV.length > 0 ? "warning" : null}
                        options={updateKV.map(({ Category, ConfigId, ConfigDesc, ConfigValue }) => ({ Category, value: ConfigId, label: `${ConfigDesc}: ${ConfigValue}` }))}
                        onChange={onUpdateNameChange}
                    />
                </Form.Item> : null}

                <Divider />

            </>}

            <Form.Item name={'Name'} label="Name" rules={[{ required: true, message: 'Please enter name!' }]}>
                <Input
                    // value={Name}
                    // onChange={(e) => { setName(e.target.value) }}
                    onChange={(e) => form.setFieldsValue({ Name: e.target.value })}
                    placeholder='Enter name'
                    maxLength={64}
                    showCount
                />
            </Form.Item>

            <Form.Item name={'Value'} label="Value" rules={[{ required: true, message: 'Please enter value!' }]}>
                <Input
                    // value={Value}
                    // onChange={(e) => { setValue(e.target.value) }}
                    onChange={(e) => form.setFieldsValue({ Value: e.target.value })}
                    placeholder='Enter value'
                    maxLength={64}
                    showCount
                />
            </Form.Item>

            <Form.Item name={'Departments'} label="Departments" rules={[{ required: true, message: 'Please select departments!' }]} initialValue={kv('department', ['1'])}>
                <Select
                    disabled={true}
                    placeholder="Select departments"
                    loading={Departments.loading}
                    status={Departments.error.length > 0 ? "error" : null}
                    options={Departments.data.map(({ Id, Name }) => ({ value: `${Id}`, label: Name }))}
                />
            </Form.Item>

            <Form.Item name={'Enabled'} label="Enabled">
                <Switch value={Enabled} onChange={(e) => setEnabled(e)} checkedChildren={on} unCheckedChildren={off} size="default" />
            </Form.Item>

        </Form>

        <ErrorResponse error={set.error ?? put.error} extra={<br />} />

        <Row justify={'end'}>
            <Col span={21} style={{ textAlign: 'right' }}>
                {mode === 'Update' ? (<Button icon={lvl > 1 ? <LockOutlined /> : null} danger disabled={lvl > 1} size="medium" onClick={() => { }} style={{ marginRight: 16 }}>Delete</Button>) : null}
                <Button disabled={lvl > 1} icon={lvl > 1 ? <LockOutlined /> : null} loading={false} onClick={() => onSubmit()} size="medium" type="primary">{mode}</Button>
            </Col>
            <Col span={3}></Col>
        </Row>

    </Form.Provider >

}

/** *** *** *** [ TYPE MODAL ] *** *** *** **/

export default ({ geve }) => {

    const [{ }, { emit }] = useBridge({ url: '' })
    const [tp, setTp] = useState({ open: false, id: -1, type: 'AssetType' })
    const [mode, setMode] = useState('Create')

    const types = [
        {
            label: 'Asset Type',
            value: 'AssetType',
        },
        {
            label: 'Special Type',
            value: 'SpecialType',
        },
        {
            label: 'Enum Type',
            value: 'EnumType',
        },
    ]

    useEffect(() => {

        const trigger = ({ open = true, id = -1, type = 'AssetType' }) => {
            setTp({ id, open, type })
            setMode(id === -1 ? 'Create' : 'Update')
        }

        geve.on('gtype', trigger)
        return () => geve.off('gtype', trigger)

    }, [])

    const props = { ...tp, mode, cb: () => { } }

    return <Modal
        title={<Segmented onChange={(e) => setTp({ ...tp, type: e })} options={types} value={tp.type} />}
        forceRender={false}
        destroyOnClose={true}
        open={tp.open}
        onCancel={() => {
            setTp({ open: false, id: -1 })
            emit('DepartmentAssetTypes', 'refetch')
        }}
        footer={null}
        width={610}
    >

        <Divider orientation="right" dashed >
            <Segmented
                value={mode}
                onChange={(e) => setMode(e)}
                options={[
                    { value: 'Create', icon: <PlusSquareOutlined /> },
                    { value: 'Update', icon: <FormOutlined /> },
                ]}
            />
        </Divider>

        {tp.type === 'AssetType' ? <AssetTypes {...props} /> : null}
        {tp.type === 'SpecialType' ? <SpecialTypes {...props} /> : null}
        {tp.type === 'EnumType' ? <EnumTypes {...props} /> : null}

    </Modal>

}