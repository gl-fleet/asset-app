import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Table, Row, Col, Select, Button, Tag, Typography, Avatar, Modal, Alert, Badge } from 'antd'
import { CheckCircleOutlined, LoadingOutlined, WifiOutlined, SwapOutlined, CalendarOutlined, ExclamationCircleFilled, SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import moment from 'moment'

import { KeyValue, ErrorResponse, Tick, kv, f, Sfy, env, SmoothAllocation, Broadcast, dateFormat, access_level } from '../../../common/utils'
import NonReturnableList from '../../../common/components/nonreturnable'
import Qualification from '../../../common/components/qualification'
import AssetPopover from '../../../common/popover/asset'
import { useBridge } from '../../../hooks/bridge'

const { Text } = Typography
const { confirm } = Modal
const tick = new Tick()

const LetMeWrap = styled.section`
    .special-items h4 {
        margin-top: 8px;
        margin-bottom: -4px;
    }
    .ant-table-footer {
        padding: 0px !important;
        overflow: hidden;
    }
    .ant-table-footer {
        border-bottom: none !important;
    }
`

/** Check whether Minlog WIFI check is required (ENV based) */
const isMinlogCheckRequired = (name = '') => {

    const prefix = env.PREFIX_PLI ?? []
    const ls = typeof prefix === 'string' ? [prefix] : prefix
    for (const x of ls) if (name.indexOf(x) === 0) return true
    return false

}

/** Get required items (ENV based) */
const getRequiredItems = () => {

    const prefix = env.REQUIRED_ITEMS ?? []
    return typeof prefix === 'string' ? [prefix] : prefix

}

export default ({ geve, event, isModal, setTitle }) => {

    const lvl = useMemo(() => access_level(), [])
    const [{ get: assets }, { get: getAssets }] = useBridge({ url: 'Assets' })
    const [{ get: { loading, data, error } }, { get: getPersonnelAsset, clear }] = useBridge({ url: 'AssetAllocations' })

    const [{ get: _wifi }, { get: getMinlog }] = useBridge({ url: 'MinlogIntegration', message: false })
    const [{ set: _assign }, { set: Assign, clear: ClearAssign }] = useBridge({ url: 'AssetAllocations/Assign', states: { set: ['Assigning', 'Assigned'] }, message: false })
    const [{ set: _return }, { set: Return, clear: ClearReturn }] = useBridge({ url: 'AssetAllocations/Return', states: { set: ['Returning', 'Returned'] }, message: true })

    const [items, setItems] = useState([])
    const history = useMemo(() => new SmoothAllocation({ update: (ms, { rfid, state }) => ms === 0 && state === 'then' && getPersonnelAsset('refetch'), effect: (e) => setItems([...e]) }), [])

    const searchRef = useRef(null)
    const isConfirmOpen = useRef(false)
    const PersonnelNoRef = useRef(-1)
    const AssignedUserId = Number(KeyValue('PersonnelNo') ?? '0')
    const [state, setState] = useState(null)
    const [Personnel, setPersonnel] = useState([-1, -1])
    const [Asset, setAsset] = useState({ assetType: '', assetId: -1, rfid: '' })
    const departments = useMemo(() => { try { return JSON.parse(kv('departments', ['{}'])) } catch (err) { return {} } }, [])
    const cast = useMemo(() => new Broadcast('logs'), [])

    const clearScreen = () => {
        setState(null)
        history.dispose()
        clear('get')
    }

    const clearErrors = (t = 'all') => {

        setState(null)

        if (t === 'all') {
            ClearAssign('set')
            ClearReturn('set')
        }

        t === 'assign' && ClearAssign('set')
        t === 'return' && ClearReturn('set')

    }

    /** Is main items allocated **/
    const requiredItemsCount = useRef(0)
    requiredItemsCount.current = useMemo(() => {

        if (typeof data === 'object' && data.hasOwnProperty("AssetAllocation")) {

            const items = data['AssetAllocation'] ?? []
            const requiredItems = getRequiredItems()
            let allocatedCount = 0
            let merged = ''

            for (const x of items) merged += `|${x.AssetTypeName}`

            if (loading) { /** While fetching ... **/ }
            else {
                for (const x of items) history.add({ ...x, status: true, loading: false })
                setItems([...history.items()])
            }

            for (const x of requiredItems) allocatedCount += merged.indexOf(x) >= 0 ? 1 : 0

            return allocatedCount

        }

        return 0

    }, [loading])

    /** Before assign hook */
    const onBeforeAssign = async (id, rfid = null, serial, assetType = '', Description, pNo, cb = null) => {

        try {

            if (pNo < 0) return null

            if (!history.isFree(rfid)) return null

            const resolve = () => { setState(null); cb !== null && cb() }

            if (typeof assetType === 'string' && typeof rfid === 'string') {

                history.add({
                    AssetId: id,
                    AssetRfid: rfid,
                    AssetSerial: serial,
                    AssetTypeName: assetType,
                    Description,
                    status: null,
                    loading: true,
                })

            }

            if (typeof assetType === 'string' && isMinlogCheckRequired(assetType)) {

                setState(<Alert key='cp_c' type="info" style={{ fontSize: 12 }} icon={<LoadingOutlined />} closable banner message={<span>Verifying the Wi-Fi signal from the Minlog system [{rfid}]</span>} />)

                getMinlog({ rfid }, (state, res) => {

                    state === 'catch' && history.after(rfid, state)

                    state === 'then' && setState(<Alert key='cp_c' type={"success"} style={{ fontSize: 12 }} icon={<WifiOutlined />} closable banner
                        message={<span><i style={{ textDecoration: 'underline' }}>{rfid}</i> {`Successfully assigned`}</span>} />)

                    state === 'catch' && setState(<Alert key='cp_c' type={"error"} style={{ fontSize: 12 }} icon={<WifiOutlined />} closable banner
                        message={<span><i style={{ textDecoration: 'underline' }}>{rfid}</i> {res[0]}</span>} />)

                    state === 'then' && resolve()

                })

            } else resolve()

        } catch (err) {

            history.after(rfid, 'catch')
            setState(<Alert key='cp_c' type={"error"} style={{ fontSize: 12 }} icon={<WifiOutlined />} closable banner message={<>{err.message} [{rfid}]</>} />)

        } finally { return null }

    }

    useEffect(() => {

        if (loading || _assign.loading || _return.loading) { }
        // KeyValue('logs', Sfy({ loading, data: { AssetAllocation: items }, error, type: 'person_asset' }))
        cast.emit(Sfy({ loading, data: { AssetAllocation: items }, error, type: 'person_asset' }))

    }, [items])

    useEffect(() => {

        tick.on((ms, value) => {

            tick.ms === 0 && assets.loading && tick.set(400)
            tick.ms === 0 && getAssets({
                DepartmentId: Number(kv('department', ['1'])),
                FilterField: 'Serial',
                FilterValue: value,
                Page: 1,
                PageSize: 10,
                SortOrder: 'asc'
            })

        })

        const execEventFetch = (PersonnelId, PersonnelNo, label, data) => {

            clearScreen()
            PersonnelNoRef.current = PersonnelNo
            setPersonnel([Number(PersonnelId), Number(PersonnelNo)])

            const { CompanyDesc = '-', DepartmentDesc = '-', PositionDesc = '-' } = data

            setTitle(
                <div style={{ paddingBottom: isModal ? 6 : 0, position: 'relative', userSelect: isModal ? 'none' : 'auto' }}>
                    <Avatar style={{ fontWeight: 'bold', backgroundColor: '#f56a00', verticalAlign: 'bottom', position: 'absolute', top: 6 }}>{(label ?? '***')[0]}</Avatar>
                    <Text style={{ display: 'block', paddingLeft: 44, fontSize: 16, fontWeight: 500 }}>
                        <span style={{ display: 'block', marginBottom: -4 }}>{label ?? '***'}</span>
                        <Text type="secondary" style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: 12, overflow: 'hidden', maxWidth: 560 }}>
                            <b style={{ textDecoration: 'underline' }}>{PositionDesc}</b> <i>({DepartmentDesc}, {CompanyDesc})</i>
                        </Text>
                    </Text>
                </div>
            )

            // KeyValue('logs', Sfy({ type: 'profile', label, value: `${PersonnelId}_${PersonnelNo}` }))
            cast.emit(Sfy({ type: 'profile', label, value: `${PersonnelId}_${PersonnelNo}` }))

            getPersonnelAsset({
                DepartmentId: Number(kv('department', ['1'])),
                FilterField: 'PersonnelNo,ReturnedDate',
                FilterValue: `${PersonnelNo},[null]`,
                Page: 1,
                PageSize: 99,
                SortField: 'Id',
                SortOrder: 'desc',
                MaxDays: 14 * 4,
            })

        }

        const eventFetch = ({ value, label, data }) => {

            const [PersonnelId, PersonnelNo] = typeof value === 'string' && value.indexOf('_') >= 0 ? value.split('_') : [null, value]

            if (PersonnelNo === PersonnelNoRef.current) return true

            if (requiredItemsCount.current === (env.REQUIRED_ITEMS ?? []).length || requiredItemsCount.current === 0 || PersonnelNoRef.current === -1) {
                execEventFetch(PersonnelId, PersonnelNo, label, data)
                return true
            }

            if (location.hash && location.hash.indexOf('#open_') === 0) execEventFetch(PersonnelId, PersonnelNo, label, data)
            else {

                if (isConfirmOpen.current) return true
                isConfirmOpen.current = true
                confirm({
                    title: label,
                    width: 480,
                    icon: <ExclamationCircleFilled />,
                    centered: true,
                    content: `Assigned ${requiredItemsCount.current} out of the ${(env.REQUIRED_ITEMS ?? []).length} required items for "${PersonnelNoRef.current}"!`,
                    okText: 'Accept',
                    cancelText: 'Cancel',
                    okType: 'danger',
                    onOk: () => execEventFetch(PersonnelId, PersonnelNo, label, data),
                    afterClose: () => { isConfirmOpen.current = false },
                })

            }

        }

        const CardReaderAsset = (arg) => {

            const id = arg?.data?.Id ?? null
            const rfid = arg?.data?.Rfid ?? null
            const assetType = arg?.data?.TypeName ?? null
            const Serial = arg?.data?.Serial ?? null
            const Description = arg?.data?.Description ?? null

            if (id) {

                setAsset({ assetType, assetId: id, rfid, Serial, Description })

                setPersonnel((e) => {

                    e[0] > 0 && e[1] && onBeforeAssign(id, rfid, Serial, assetType, Description, e[1], () => {

                        Assign({
                            assetId: id,
                            personnelId: e[0],
                            personnelNo: e[1],
                            assignedUserId: AssignedUserId,
                        }, (is, e) => history.after(rfid, is))

                    })

                    return e

                })

            }

        }

        const ClearPerson = (e) => {

            clearScreen()
            clearErrors('all')
            setPersonnel([-1, -1])
            requiredItemsCount.current = 0
            PersonnelNoRef.current = -1

        }

        event.on('assign-person', eventFetch)
        geve.on('asset-reader', CardReaderAsset)
        geve.on('clear-person', ClearPerson)

        return () => {
            event.off('assign-person', eventFetch)
            geve.off('asset-reader', CardReaderAsset)
            geve.off('clear-person', ClearPerson)
        }

    }, [])

    const onAssign = () => onBeforeAssign(Asset.assetId, Asset.rfid, Asset.Serial, Asset.assetType, Asset.Description, Personnel[1], () => {

        Assign({
            assetId: Asset.assetId,
            personnelId: Personnel[0],
            personnelNo: Personnel[1],
            assignedUserId: AssignedUserId,
        }, (is) => history.after(Asset.rfid, is), Asset.assetType)

    })

    const onReturn = (AssetAllocationId, AssetId, AssetTypeName, AssetRfid = '#') => {

        history.loading(AssetRfid, true)

        Return({
            AssetAllocationId,
            AssetId,
            ReturnedUserId: AssignedUserId,
        }, (is) => {

            is === 'then' && history.clear(AssetRfid)
            is === 'catch' && history.after(AssetRfid, is)
            is === 'finally' && history.loading(AssetRfid, false)

        }, AssetTypeName)

    }

    const onSearch = (value) => tick.set(300, value)

    const onChange = (value, { assetType, rfid, Serial, Description }) => typeof value === 'number' && value >= 0 && setAsset({ assetType, assetId: value, rfid: rfid, Serial, Description })

    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

    const columns = [
        {
            title: 'Serial',
            dataIndex: 'AssetSerial',
            // render: (text) => <Tag color={'geekblue'} icon={<BarcodeOutlined />}>{text}</Tag>,
            render: (text, { AssetId, Description }) => <AssetPopover id={AssetId} text={text} description={Description} />,
        },
        {
            title: 'Type',
            dataIndex: 'AssetTypeName',
            render: f
        },
        {
            title: 'Assigned Date',
            dataIndex: 'AssignedDate',
            render: (t) => <Tag icon={<CalendarOutlined />}>{moment(t).format(dateFormat)}</Tag>
        },
        {
            title: 'Action',
            render: ({ Id, AssetId, AssetRfid, ReturnedDate, AssetTypeName, loading: _loading, status: _status, count: _count }) => {

                if (_loading === true) return <Button size="small" type='dashed' disabled={true} loading={true}>Assign</Button>
                if (_status === null) return <Button size="small" type='dashed' disabled={true}><SwapOutlined style={{ fontSize: 12 }} />Return</Button>
                if (_status === false) return <Button danger size="small" type='dashed'><SwapOutlined style={{ fontSize: 12 }} />Failed</Button>

                return moment(ReturnedDate).isValid() ?
                    <Button size="small" type="dashed">
                        Returned
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    </Button> :
                    <Button key={`__frame_${AssetRfid}_${_count}__`} className={_count > 0 ? `animate__animated animate__flash animate__faster` : ''} size="small" type="dashed" disabled={_return.loading} onClick={() => onReturn(Id, AssetId, AssetTypeName, AssetRfid)}>
                        <SwapOutlined style={{ fontSize: 12 }} />
                        Return
                    </Button>
            }
        },

    ]

    const footer = useMemo(() => {

        const f = []
        state ? f.push(state) : null
        f.push(error.map((err, idx) => <Alert key={`err_${idx} `} message={`${err} + :)`} type="warning" showIcon banner closable />))

        const errors = _assign.error ?? _return.error

        if (errors.length > 0 && typeof errors[0] === 'string' && errors[0].indexOf('Department: #') > 0) {
            try {

                const depId = Number(errors[0].split('Department: #')[1])
                const generated = errors[0].replace('Department:', `Department @${departments[depId] ?? 'Unknown'}`)
                errors[0] = generated

            } catch (err) { console.log(err) }
        }

        if (errors.length > 1 && typeof errors[1] === 'object') {

            const { Id, AssetId } = errors[1]
            const ReturnButton = () => <div>
                {errors[0]} {`/ ${AssetId} `}
                (<Button style={{ padding: '0px 3px' }} size="small" type="link" onClick={() => onReturn(Id, AssetId, null)}>Return</Button>)
            </div>
            f.push(<ErrorResponse key="allocation_result" error={[<ReturnButton />]} />)

        } else f.push(<ErrorResponse key="allocation_result" error={errors} />)

        return f

    }, [_assign.error.length, _return.error.length, state])

    useEffect(() => { _return.loading === false && clearErrors('all') }, [_return.loading])
    // useEffect(() => { _assign.loading === false && clearErrors('assign') }, [_assign.loading])

    return <LetMeWrap>

        <Row gutter={8}>

            <Col span={24}>
                <Badge.Ribbon /* color='rgb(245, 106, 0)' */ text={loading ? <SyncOutlined spin /> : <SyncOutlined style={{ cursor: 'pointer' }} onClick={() => getPersonnelAsset('refetch')} />} >
                    <Table
                        rowKey="AssetRfid"
                        bordered={true}
                        className={'query_table'}
                        columns={columns}
                        dataSource={items}
                        pagination={false}
                        size="small"
                        footer={() => footer}
                    />
                </Badge.Ribbon>
            </Col>

        </Row>

        <br />

        {Personnel[1] >= 0 ? <>
            <NonReturnableList PersonnelId={Personnel[0]} PersonnelNo={Personnel[1]} geve={geve} />
            <br />
        </> : null}

        {Personnel[1] >= 0 ? <>
            <Qualification geve={geve} PersonnelNo={Personnel[1]} />
            <br />
        </> : null}


        <Row gutter={8}>

            <Col span={16}>

                <Select
                    loading={assets.loading}
                    autoClearSearchValue={false}
                    menuItemSelectedIcon={<SwapOutlined />}
                    ref={searchRef}
                    style={{ width: '100%' }}
                    showSearch
                    placeholder={'Asset Serial#'}
                    optionFilterProp="children"
                    onChange={onChange}
                    onSearch={onSearch}
                    onFocus={() => (assets.data.Asset ?? []).length === 0 && onSearch('')}
                    filterOption={filterOption}
                    options={(assets.data.Asset ?? [])/*.filter(({ TypeName }) => TypeName[0] !== '-')*/.map(({ Id, TypeName, Rfid, Serial, Description }) => ({
                        disabled: TypeName[0] === '-',
                        Serial,
                        rfid: Rfid,
                        assetType: TypeName,
                        Description,
                        value: Id,
                        label: `${TypeName ?? Rfid} [${Serial}]`
                    }))}
                />

            </Col>

            <Col span={8}>

                <Button
                    loading={_assign.loading}
                    style={{ width: '100%' }}
                    disabled={lvl > 3 || Asset.assetId < 0 || Personnel[1] < 0}
                    onClick={() => onAssign()}
                >Assign</Button>

            </Col>

        </Row>

    </LetMeWrap >

}