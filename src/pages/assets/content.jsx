import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Modal, DatePicker, Button, Input, Space, Table, Dropdown, Typography, Badge, Tag, message } from 'antd'
import { CalendarOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExportOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, HomeOutlined, FolderOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'
import { useParams } from "react-router-dom"
import moment from 'moment'
import dayjs from 'dayjs'

import { KeyValue, PageSize, ErrorResponse, StatesColorMap, d, myAccess, df, use_description, f, persist, kv, iss, myDeps, access_level } from '../../common/utils'
import PersonPopover from '../../common/popover/person'
import AssetPopover from '../../common/popover/asset'
import { useBridge } from '../../hooks/bridge'
import { useScreen } from '../../hooks/screen'

const { Text } = Typography
const { RangePicker } = DatePicker

export default ({ geve, event }) => {

    const lvl = useMemo(() => access_level(), [])
    const [{ get: { loading, data, error } }, { get, del, on }] = useBridge({ url: 'Assets' })
    const [{ }, { put: MoveDepartment }] = useBridge({ url: 'Assets/MoveDepartment' })
    const [{ }, { get: getDepartmentAssetTypes }] = useBridge({ url: 'DepartmentAssetTypes', get: [] })
    const [{ }, { set: RemoveItem }] = useBridge({ url: 'AssetCheckHistories', message: false })
    const [filter, setFilter] = useState({ DepartmentId: Number(KeyValue('department') ?? '1'), Page: 1, PageSize, SortField: "ModifiedDate", SortOrder: "desc" })

    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [searchedColumn, setSearchedColumn] = useState('')
    const [modal, modalContextHolder] = Modal.useModal()
    const [searchText, setSearchText] = useState('')
    const [ctxMenu, setCtxMenu] = useState([])
    const searchInput = useRef(null)
    const size = useScreen()

    const { id } = useParams()
    const desc = useMemo(() => { return use_description(location.hash.replace('#', '').replaceAll('_', ' ')) }, [location.hash])
    const descType = desc !== null ? desc.c[0] : null

    useEffect(() => {

        if (loading === false) {
            const { AssetCount } = data
            event.emit('asset-total', AssetCount ?? '*')
        }

    }, [loading])

    useEffect(() => {

        const findTR = (node, count = 8) => {

            if (node.nodeName === 'TR') return node
            if (count === 0) return null
            return findTR(node.parentNode, count - 1)

        }

        const select = (key) => setSelectedRowKeys((current) => {

            if (current.includes(Number(key))) return current
            return [Number(key)] /* Should select one */

        })

        const edit = (key) => event.emit('assets.popup.edit', key)

        const deleteConfirm = (key) => modal.confirm({
            title: `Are you sure delete this ${key}?`,
            icon: <DeleteOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {

                const CheckedUserId = Number(KeyValue('PersonnelNo') ?? '0')
                RemoveItem({ AssetId: key, CheckedDate: dayjs().format(df), CheckedUserId, Status: "Deleted" }, (is) => is === 'then' && get('refetch'))
                // del(key, (is) => is === 'then' && get('refetch'))

            },
        })

        const NoItemSelected = (e) => {

            const element = findTR(e.target)
            const key = element ? element.getAttribute('data-row-key') : null

            if (key === null) setCtxMenu([{ key: '1', type: 'group', label: `View page source` }])
            else {

                const rk = key.split('_')
                select(rk[0])
                setCtxMenu([
                    {
                        key: rk[0],
                        type: 'group',
                        label: `Selected key ${rk[0]}`,
                        disabled: true,
                        children: [
                            { key: '1-2', label: 'Edit', icon: <FormOutlined />, onClick: () => edit(rk), disabled: lvl > 3 },
                            { key: '1-3', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => deleteConfirm(rk[0]), disabled: lvl > 3 },
                        ],
                    },
                ])

            }

        }

        const ItemsSelected = (ls) => {

            const move = (n) => MoveDepartment('', {
                "AssetIDs": ls.map((x) => Number(x.split('_')[0])),
                "ToDepartmentID": n.DepartmentId,
                "ToAssetTypeID": n.AssetTypeId,
                "ModifiedUserId": Number(KeyValue('PersonnelNo') ?? '0'),
            }, (t, d) => { t === 'finally' && get('refetch') })

            getDepartmentAssetTypes({}, (t, d) => {

                t === 'catch' && console.log(d[0])
                t === 'then' && setTimeout(() => {

                    const children = []
                    const obj = {}

                    d.forEach(({ Id, DepartmentId, DepartmentName, AssetTypeId, AssetTypeName }) => {
                        if (!obj.hasOwnProperty(DepartmentName)) obj[DepartmentName] = []
                        obj[DepartmentName].push({ DepartmentId, Id, AssetTypeId, AssetTypeName })
                    })

                    for (const x in obj) {

                        const children2 = []
                        let disabled = !myDeps().includes(obj[x][0].DepartmentId)

                        for (const i of obj[x]) {

                            const { Id, AssetTypeName } = i
                            children2.push({ key: Id, label: AssetTypeName, icon: <FolderOutlined />, onClick: () => move(i), disabled: AssetTypeName[0] === '-' ? true : lvl > 3 })

                        }

                        children.push({ key: x, label: x, icon: <HomeOutlined />, disabled: disabled ? true : lvl > 3, children: children2 })

                    }
                    /** Department don't have any registered Asset Types, If you don't see the Department name */
                    setCtxMenu([{
                        key: '1',
                        type: 'group',
                        label: `Bulk actions`,
                        children: [
                            { key: '1-1', label: 'Move to', icon: <ExportOutlined />, onClick: () => { }, disabled: lvl > 3, children },
                            { key: '1-2', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => message.warning('Under development'), disabled: true },
                        ]
                    }])

                })

            })

            setCtxMenu([{
                key: '1',
                type: 'group',
                label: `Bulk actions`,
                children: [
                    { key: '1-1', label: 'Move (...)', icon: <ExportOutlined />, disabled: lvl > 3 },
                    { key: '1-2', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => message.warning('Under development'), disabled: true },
                ]
            }])

        }

        document.querySelector(".query_table").addEventListener("contextmenu", (e) => {

            e.preventDefault()

            setSelectedRowKeys((current) => {
                current.length > 0 ? ItemsSelected(current) : NoItemSelected(e)
                return current
            })

        })

        /** Auto-filter Assets using RFID when swiping over a reader */
        const AssetReader = ({ data }) => {
            data.Id && setFilter((e) => ({ ...e, FilterField: 'Rfid', FilterValue: data.Rfid }))
        }
        geve.on('asset-reader', AssetReader)
        return () => geve.off('asset-reader', AssetReader)

    }, [])

    useEffect(() => { on((e) => e.payload === 'refetch' && get('refetch')) }, [])

    const inspection_columns = useMemo(() => {

        try {

            if (kv('iInspection', ['On']) !== 'On') return []
            const data = persist.get('department_asset_type')
            const insp = data[id]['AssetCheckTypeSettings']
            return insp.filter(({ Enabled }) => Enabled === 1).map(({ Id, CheckType, CheckPeriod: PeriodMonth, ExpireNear: AlertDay, StartDate }) => {

                const name = CheckType?.CheckName ?? '?'

                return {
                    title: <Badge size='small' count={<ClockCircleOutlined style={{ paddingLeft: 12, fontSize: 10 }} />}><span style={{ textTransform: 'capitalize' }}>{name}</span></Badge>,
                    render: (t, { AssetInspectionResult }) => {

                        const inspectionResults = Array.isArray(AssetInspectionResult) ? AssetInspectionResult : [];

                        let alias = '-';
                        for (const x of inspectionResults) {
                            if (x.InspectionType === name) {
                                alias = x.LastInspectionDate;
                                break; // No need to continue once found
                            }
                        }

                        if (alias === '-') return '-';

                        const startDate = moment(alias === '-' ? StartDate : alias).valueOf()
                        const currDate = moment().valueOf()
                        const days = ((currDate - startDate) / 1000 / 60 / 60 / 24) % (PeriodMonth * 30)

                        const actual_days = ((currDate - startDate) / 1000 / 60 / 60 / 24)
                        const target_days = PeriodMonth * 30
                        const diff = target_days - actual_days

                        const left = Number((diff).toFixed(0))
                        const color = left <= 3 ? 'red' : left <= 7 ? 'orange' : 'green'
                        const icon = left <= 3 ? <ExclamationCircleOutlined /> : left <= 7 ? <ClockCircleOutlined /> : <CheckCircleOutlined />

                        return <Tag title={`${left} day(s) util next periodic check!`} color={color} icon={icon} >{moment(alias).format(df)}</Tag>

                    },
                    hidden: size <= 5,
                }

            })

        } catch (e) { return [] }

    }, [id, size])

    useEffect(() => { get({ ...filter, TypeId: id }) }, [filter, id])

    /*** *** *** *** *** *** *** *** *** *** *** *** ***/
    const tableEvent = (pagination, filters, sorter, extra) => {

        let filterField = ''
        let filterValue = ''
        let once = true

        const fx = (n) => n

        Object.keys(filters).forEach((field) => {
            if (filters[field] !== null) {
                filterField += `${once ? '' : ','}${field}`
                filterValue += `${once ? '' : ','}${fx(filters[field][0])}`
                once = false
            }
        })

        setFilter((e) => ({
            ...e,
            Page: pagination.current ?? e.Page,
            PageSize: pagination.pageSize ?? e.PageSize,
            FilterField: iss(filterField) ? filterField : null,
            FilterValue: iss(filterValue) ? filterValue : null,
            SortField: iss(sorter.field) ? sorter.field : null,
            ...(typeof sorter.order === 'string' && ['descend', 'ascend'].includes(sorter.order)) ? { SortOrder: sorter.order === 'descend' ? 'desc' : 'asc' } : { SortOrder: 'desc' }
        }))

    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters, dataIndex) => {
        clearFilters()
        setSearchText('')
        setFilter((e) => {
            try {
                if (e.FilterField === dataIndex) return ({ ...e, FilterField: dataIndex, FilterValue: '' })
                else return e
            } catch (err) { return e }
        })
    }

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >Search</Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >Reset</Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys)[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >Filter</Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => { close() }}
                    >close</Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) => (record[dataIndex] ?? '')
            .toString()
            .toLowerCase()
            .includes((value).toLowerCase()),
        /* onFilterDropdownOpenChange: (visible) => {
            if (visible) { setTimeout(() => searchInput.current?.select(), 100) }
        }, */
        filterDropdownProps: {
            onOpenChange(visible) {
                if (visible) { setTimeout(() => searchInput.current?.select(), 100) }
            }
        },
        render: (text) => searchedColumn === dataIndex ? (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        ) : (text),
    })

    const getDateTimeProps = (idx) => {

        return {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <div style={{ marginBottom: 8, display: 'block' }} >
                    <RangePicker />
                </div>
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        style={{ width: 90 }}
                    >Search</Button>
                    <Button
                        size="small"
                        style={{ width: 90 }}
                    >Reset</Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => close()}
                    >close</Button>
                </Space>
            </div>,
            filterIcon: (filtered) => <CalendarOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
            onFilter: (val, rec) => true,
            filterDropdownProps: {
                onOpenChange: (visible) => { }
            },
            render: d
        }

    }

    const rowSelection = { selectedRowKeys, onChange: (newSelectedRowKeys) => { setSelectedRowKeys(newSelectedRowKeys) } }

    const { FilterField, FilterValue } = filter
    const fFields = (FilterField ?? '').split(',')
    const fValues = (FilterValue ?? '').split(',')
    const fInject = (e) => {

        const idx = fFields.findIndex((el) => el === e.dataIndex)
        let title = `${e.title}`
        if (idx > -1) e.title = <span>
            <span>{title}: </span>
            <span style={{ color: '#1677ff' }}>{fValues[idx]}*</span>
        </span>
        return e

    }

    const columns = [
        {
            title: 'Rfid',
            dataIndex: 'Rfid',
            ...getColumnSearchProps('Rfid'),
            sorter: (a, b) => a.Rfid.length - b.Rfid.length,
            sortDirections: ['descend', 'ascend'],
            render: (text, { Id }) => <AssetPopover id={Id} text={text} tag />,
            hidden: size < 3
        },
        {
            title: 'Serial',
            dataIndex: 'Serial',
            ...getColumnSearchProps('Serial'),
            render: (text, { Id }) => <AssetPopover id={Id} text={text} />,
        },
        {
            title: 'Type',
            dataIndex: 'TypeName',
            ...getColumnSearchProps('TypeName'),
            render: (text, { AssetTypeId }) => <Text className='vlink' onClick={() => geve.emit('gtype', { id: AssetTypeId, open: true })}>{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            hidden: desc !== null,
            render: (text) => <Tag color={StatesColorMap[text ?? 'Active']}>{text ?? 'Active'}</Tag>
        },
        {
            title: desc !== null ? 'Status[*]' : 'Description',
            dataIndex: 'Description',
            hidden: desc === null,
            filterMultiple: false,
            ...(descType === null || descType === '[TEXT]' ? {
                ...getColumnSearchProps('Description'),
            } : {
                filters: desc.v[1].filter(i => i !== 'Normal').map((i) => ({ text: i, value: i }))
            }),
            render: (text, { Status }) => {

                const status = Status ?? 'Active'

                if (descType === '[SELECT]') {

                    const v = desc.v[1].findIndex(e => e === text)
                    const c = v >= 0 ? desc.c[1][v] : ''
                    return <div>
                        <Tag color={StatesColorMap[status]}>{status}</Tag>
                        {text ? <Tag color={c}>{text}</Tag> : null}
                    </div>

                }

                if (descType === '[TEXT]') {

                    const c = desc.c[1][0]
                    return <div>
                        <Tag color={StatesColorMap[status]}>{status}</Tag>
                        {text ? <Tag color={c}>{text}</Tag> : null}
                    </div>

                }

                return null

            },
        },
        {
            title: 'Started Using Date',
            dataIndex: 'StartedUsingDate',
            ...getColumnSearchProps('StartedUsingDate'),
            // ...getDateTimeProps("StartedUsingDate"),
            render: d,
            hidden: size < 3
        },
        {
            title: 'Last Used Date',
            dataIndex: 'LastUsingDate', // LastUsingDate
            ...getColumnSearchProps('LastUsingDate'),
            render: d,
            hidden: size <= 5
        },
        ...inspection_columns,
        {
            title: 'Modified User',
            dataIndex: 'ModifiedUserName',
            ...getColumnSearchProps('ModifiedUserName'),
            render: (text, { ModifiedUserId, ModifiedUserName }) => ModifiedUserId === 0 ? <PersonPopover id={0} /> : <PersonPopover id={ModifiedUserId} text={f(ModifiedUserName)} />,
            hidden: size < 5
        },

        // ].filter(item => !item.hidden)
    ].filter(item => !item.hidden).map(fInject)

    return <div style={{ overflowX: 'auto' }}>
        {modalContextHolder}
        <Dropdown menu={{ items: ctxMenu }} trigger={['contextMenu']} >
            <div>
                <Table
                    loading={loading}
                    rowKey={"uid"}
                    className={'query_table'}
                    columns={columns}
                    dataSource={(data.Asset ?? []).map((e) => ({ ...e, uid: `${e.Id}_${e.LastMaintenanceId ?? '0'}` }))}
                    rowSelection={rowSelection}
                    pagination={{ pageSize: filter.PageSize, total: data.PageCount * filter.PageSize }}
                    size="small"
                    bordered={true}
                    onChange={tableEvent}
                />
                <ErrorResponse error={error} extra={<br />} />
            </div>
        </Dropdown>
    </div>

}