import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Modal, Form, Col, Row, DatePicker, Divider, theme } from 'antd'
import { Segmented, Button, Switch, Select, Input, InputNumber, Skeleton } from 'antd'
import { LockOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'

import { Broadcast, ErrorResponse, KeyValue, Sfy, iss, df, myAccess, access_level } from '../../utils'
import { useBridge } from '../../../hooks/bridge'
import { IconMap } from '../../svgs'

const { useToken } = theme
const { confirm } = Modal
const LetMeWrap = styled.section`
    .ant-form-item {
        margin-bottom: 12px;
    }
`

/** *** *** *** [ PERSONNEL SETTING ] *** *** *** **/

export const PersonnelSetting = (_) => {

    const lvl = useMemo(() => access_level(), [])
    const did = useRef(0)
    const { token } = useToken()
    const [form] = Form.useForm()
    const [hide, setHide] = useState({})

    const [dataTypes, actionTypes] = useBridge({ url: 'NonReturnableAssetTypes' })
    const [dataPermits, actionPermit] = useBridge({ url: 'NonReturnableAssetPersonnelPermits' })
    const [dataSettings, actionSettings] = useBridge({ url: 'NonReturnableAssetPersonnelSettings' })

    const cast = useMemo(() => new Broadcast('logs'), [])

    useEffect(() => actionTypes.get({}), [])
    useEffect(() => actionPermit.get({
        FilterField: _.PersonnelId === null ? 'PersonnelNo' : 'PersonnelId',
        FilterValue: _.PersonnelId === null ? _.PersonnelNo : _.PersonnelId,
        PageSize: 999
    }), [])

    useEffect(() => { ++did.current }, [dataTypes.get.loading])
    useEffect(() => { ++did.current }, [dataPermits.get.loading])

    useEffect(() => {

        return () => {

            actionPermit.emit('NonReturnableAssetPersonnelPermits', 'refetch')
            // KeyValue('logs', Sfy({ type: 'nonreturnable', action: 'refetch', time: `${Date.now()}` }))
            cast.emit(Sfy({ type: 'nonreturnable', action: 'refetch', time: `${Date.now()}` }))

        }

    }, [])

    const items = useMemo(() => {

        const ls = dataTypes.get.data?.AssetAllocation ?? []
        const ps = dataPermits.get.data ?? []
        const curr = {}
        const obj = {}

        Array.isArray(ps) && ps.forEach((e, i) => {
            if (e.SettingsValueType === `[DATE]` && e.SettingsValue) e.SettingsValue = dayjs(e.SettingsValue)
            if (e.SettingsValueType === `[CHECK]`) e.SettingsValue = e.SettingsValue === 'true'
            curr[`${e.TypeName}|${e.SettingsFieldName}`] = e.SettingsValue
        })

        ls.forEach((e, i) => {

            obj[e.Id] = false
            const prs = {}
            for (const x in e) prs[`${e.Name}|${x}`] = e[x]
            e.InitialValue = { ...prs, ...curr }

        })

        Array.isArray(ps) === true && ps.map((e, i) => {

            obj[e.AssetTypeId] = e.Enabled ? true : false
            return e

        })

        setHide(obj)

        return ls.filter(({ Name }) => Name[0] !== '-')

    }, [dataTypes.get.data, dataPermits.get.data])

    const onSubmit = () => {

        _.modifyState(false)

        const normalize = (obj) => {

            for (const x in obj) {
                if (obj[x] instanceof dayjs) obj[x] = dayjs(obj[x]).format(df)
                if (typeof obj[x] === 'boolean') obj[x] = obj[x] ? 'true' : 'false'
            }

            const pre = []
            for (const x in obj) {
                try {

                    if (obj[x] !== null) {

                        const sp = x.split('|')

                        if (sp.length === 3 && obj[`${sp[0]}|${sp[1]}`] !== null) {
                            pre.push({
                                "PersonnelId": _.PersonnelId,
                                "PersonnelNo": _.PersonnelNo,
                                "FieldId": sp[2],
                                "Value": obj[`${sp[0]}|${sp[1]}`],
                            })
                        }

                    }

                } catch (err) { }
            }

            return pre

        }

        form.validateFields().then((e) => {

            normalize(e).forEach((e) => { actionSettings.set(e) })

        }).catch((e) => console.log('Catch', e))

    }

    if (dataTypes.get.loading) return <Skeleton />
    if (dataPermits.get.loading && did.current <= 4) return <Skeleton />

    const disabled = lvl > 3

    return <Form.Provider>
        <div style={{ maxHeight: 720, overflow: 'auto', marginBottom: 24, border: '1px dotted #e5e5e5' }}>
            {items.map((e, i) => (
                <div key={e.Id}>

                    <Divider orientation="left" dashed style={{ cursor: 'pointer !important' }} >
                        <Switch
                            disabled={disabled}
                            size="small"
                            checked={hide[e.Id]}
                            loading={dataPermits.set.loading || dataPermits.get.loading}
                            onChange={(c) => actionPermit.set({

                                "PersonnelId": _.PersonnelId,
                                "PersonnelNo": _.PersonnelNo,
                                "AssetTypeId": `${e.Id}`,
                                "Enabled": `${c ? 1 : 0}`,

                            }, (is) => is === 'then' && actionPermit.get('refetch'))}
                        />
                        <span style={{ padding: '0px 8px' }}>{e.Name}</span>
                        {IconMap(token, e.IconName, {})}
                    </Divider>

                    <Form
                        form={form}
                        name={`${e.Name}_${e.Id}`}
                        size={'small'}
                        layout="horizontal"
                        labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
                        wrapperCol={{ xs: { span: 24 }, sm: { span: 15 } }}
                        initialValues={{ ...e.InitialValue }}
                        onValuesChange={() => {
                            _.modifyState(true)
                        }}
                    >

                        <Form.Item label={'Interval'} name={`${e.Name}|CooldownDays`}>
                            <InputNumber
                                // variant="borderless"
                                disabled={true}
                                placeholder='Cooldown Days'
                                maxLength={3}
                                addonAfter={`days`}
                            />
                        </Form.Item>

                        <Form.Item label={'Limit'} name={`${e.Name}|Limit`}>
                            <InputNumber
                                // variant="borderless"
                                disabled={true}
                                placeholder='Limit'
                                maxLength={3}
                                addonAfter={`count`}
                            />
                        </Form.Item>

                        {e.NonReturnableAssetFields.filter(({ FieldName }) => FieldName[0] !== '-').map(({ Id, FieldName, ValueType }) => {

                            if (iss(FieldName) && iss(ValueType)) {

                                let NonReturnable = <Input disabled placeholder='[UnknownType]' style={{ maxWidth: 173 }} />
                                if (ValueType === '[CHECK]') NonReturnable = <Switch disabled={!hide[e.Id]} />
                                else if (ValueType === '[DATE]') NonReturnable = <DatePicker disabled={!hide[e.Id]} format={df} />
                                else if (ValueType === '[TEXT]') NonReturnable = <Input disabled={!hide[e.Id]} placeholder={`Enter ${FieldName}`} style={{ maxWidth: 173 }} />
                                else NonReturnable = <Select
                                    style={{ width: 120 }}
                                    placeholder={`Select ${FieldName}`}
                                    disabled={!hide[e.Id]}
                                    value={FieldName[0] === '_' ? ValueType.split(',')[0] : ''}
                                    options={ValueType.split(',').map(s => ({ value: s, label: s }))}
                                />

                                return <div key={Id} >
                                    <Form.Item disabled={disabled} style={{ display: 'none' }} name={`${e.Name}|${FieldName}|${Id}`}><Input /></Form.Item>
                                    <Form.Item disabled={disabled} label={FieldName} name={`${e.Name}|${FieldName}`}>{NonReturnable}</Form.Item>
                                </div>

                            } else return null

                        })}

                    </Form>

                </div>
            ))}

        </div>

        <ErrorResponse error={dataSettings.set.error} extra={<br />} />

        <Row justify={'end'}>
            <Col span={24} style={{ textAlign: 'right' }}>
                <Button disabled size="medium" key="back" onClick={() => { }} style={{ marginRight: 16 }}>Close</Button>
                <Button disabled={lvl > 3} icon={lvl > 3 ? <LockOutlined /> : null} loading={dataSettings.set.loading} onClick={() => onSubmit()} size="medium" type="primary">Save</Button>
            </Col>
        </Row>

    </Form.Provider>

}

/** *** *** *** [ TYPE MODAL ] *** *** *** **/

export default ({ geve }) => {

    const isModified = useRef(false)
    const [tp, setTp] = useState({ open: false, id: -1, type: 'PersonnelSetting', PersonnelId: '', PersonnelNo: '' })
    const types = [
        {
            label: `Personnel Setting ${tp.PersonnelNo ?? '-'}`,
            value: 'Personnel Setting',
        }
    ]

    useEffect(() => {

        const trigger = ({ open = true, id = -1, type = 'PersonnelSetting' }) => {

            if (typeof id !== 'string') setTp({ id, open, type, PersonnelId: null, PersonnelNo: id })
            else {
                const [PersonnelId, PersonnelNo] = id.split('_')
                setTp({ id, open, type, PersonnelId, PersonnelNo })
            }

        }
        geve.on('gperson', trigger)
        return () => geve.off('gtype', trigger)

    }, [])

    const modifyState = (e) => { isModified.current = e }

    const showDiscardConfirm = () => confirm({
        title: `Discard changes?`,
        icon: <ExclamationCircleFilled />,
        centered: true,
        content: 'Are you sure you want to discard your changes?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
            modifyState(false)
            setTp({ open: false, id: -1 })
        },
        onCancel: () => { },
    })

    return <Modal
        // bodyStyle={{ overflowY: 'auto', maxHeight: '40em' }}
        title={
            <Segmented
                onChange={(e) => setTp({ ...tp, type: e })}
                options={types}
                value={tp.type}
            />
        }
        forceRender={false}
        destroyOnClose={true}
        centered
        open={tp.open}
        onCancel={() => isModified.current ? showDiscardConfirm() : setTp({ open: false, id: -1 })}
        footer={null}
        // footer = {[
        //     <Button disabled size="medium" key="back" onClick={() => {
        //     }} style={{marginRight: 16}}>Close</Button>,
        //     <Button key="save" disabled={!myAccess()} icon={myAccess() ? null : <LockOutlined/>}
        //             loading={dataSettings.set.loading} onClick={() => onSubmit()} size="medium"
        //             type="primary">Save</Button>
        // ]}
        width={610}
    >
        <LetMeWrap>
            <PersonnelSetting {...tp} modifyState={modifyState} />
        </LetMeWrap>

    </Modal>

}