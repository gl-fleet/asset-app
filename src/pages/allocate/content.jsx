import moment from 'moment'
import Highlighter from 'react-highlight-words'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarOutlined, ClockCircleOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons'
import { Typography, Button, Dropdown, Input, Modal, Space, Table, Tag } from 'antd'
import { Link, useLocation } from "react-router-dom"
import queryString from 'query-string'

import { ErrorResponse, KeyValue, PageSize, kv, d, f, iss, access_level } from '../../common/utils'
import AssetPopover from '../../common/popover/asset'
import PersonPopover from '../../common/popover/person'
import { useBridge } from '../../hooks/bridge'
import { useScreen } from '../../hooks/screen'

const { Text } = Typography

export default ({ geve }) => {

    const lvl = useMemo(() => access_level(), [])
    const [{ get: { loading, data, error }, get: assets }, { get }] = useBridge({ url: 'AssetAllocations' })
    const [{ set: Return }, { set: SetReturn }] = useBridge({ url: 'AssetAllocations/Return', states: { set: ['Returning', 'Returned', 'Returning failed'] } })
    const [filter, setFilter] = useState({ DepartmentId: Number(KeyValue('department') ?? '1'), Page: 1, PageSize, SortField: "Id", SortOrder: "desc" })
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [searchedColumn, setSearchedColumn] = useState('')
    const [searchText, setSearchText] = useState('')
    const [ctxMenu, setCtxMenu] = useState([])
    const searchInput = useRef(null)
    const [modal, modalContextHolder] = Modal.useModal()
    const size = useScreen()
    const loc = useLocation()
    const findId = (key) => {

        const ls = assets.data?.AssetAllocation ?? []
        for (const x of ls) if (x.Id === Number(key)) return x
        return {}

    }

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

        document.querySelector(".query_table").addEventListener("contextmenu", (e) => {

            e.preventDefault()
            const element = findTR(e.target)
            const key = element ? element.getAttribute('data-row-key') : null

            if (key === null) setCtxMenu([{ key: '1', type: 'group', label: `View page source` }])
            else {

                const ReturnedUserId = Number(kv('PersonnelNo', ['0']))
                const { Id, AssetId, AssetTypeName } = findId(key)
                select(key)

                setCtxMenu([
                    {
                        key: key,
                        type: 'group',
                        label: `Selected key ${key}`,
                        disabled: true,
                        children: [
                            {
                                key: '1-2',
                                label: 'Return',
                                icon: <SwapOutlined />,
                                disabled: lvl > 3,
                                onClick: () => SetReturn({ AssetAllocationId: Id, AssetId, ReturnedUserId }, (is) => is === 'then' && get('refetch'), AssetTypeName)
                            },
                        ],
                    },
                ])

            }

        })

        const AssetAllocationsEvent = () => get('refetch')
        geve.on('AssetAllocations', AssetAllocationsEvent)
        return () => geve.off('AssetAllocations', AssetAllocationsEvent)

    }, [])

    useEffect(() => { get({ ...filter, MaxHistory: 1000000 }) }, [filter])

    useEffect(() => {

        const parsed = queryString.parse(loc.search)
        const count = Object.keys(parsed ?? {}).length

        if (count >= 4) setFilter((e) => {

            e.FilterField = `AssetTypeName,AssetTypeName,ReturnedDate,AssignedDate`
            e.FilterValue = `${parsed.AssetTypeName},${parsed.AssetTypeName},[null],${parsed.StartDate}|${parsed.EndDate}`
            e.SortField = "AssignedDate"
            e.SortOrder = "desc"

            return { ...e }
        })
        else setFilter({
            DepartmentId: Number(KeyValue('department') ?? '1'),
            Page: 1, PageSize,
            SortField: "Id",
            SortOrder: "desc",
        })

    }, [loc.search])

    /*** *** *** *** *** *** *** *** *** *** *** *** ***/

    const tableEvent = (pagination, filters, sorter, extra) => {

        let filterField = ''
        let filterValue = ''
        let once = true

        const fx = (n) => {
            if (n === 'AssetRfid') return 'Rfid'
            return n
        }

        Object.keys(filters).forEach((field) => {
            if (filters[field] !== null) {
                filterField += `${once ? '' : ','}${field}`
                filterValue += `${once ? '' : ','}${fx(filters[field][0])}`
                once = false
            }
        })

        setFilter((e) => {
            e.Page = pagination.current ?? e.Page
            e.PageSize = pagination.pageSize ?? e.PageSize
            e.FilterField = iss(filterField) ? filterField : null
            e.FilterValue = iss(filterValue) ? filterValue : null
            e.SortField = iss(sorter.field) ? sorter.field : null
            if (typeof sorter.order === 'string' && ['descend', 'ascend'].includes(sorter.order)) e.SortOrder = sorter.order === 'descend' ? 'desc' : 'asc'
            return { ...e }
        })

    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
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
                        onClick={() => clearFilters && handleReset(clearFilters)}
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

    const rowSelection = { selectedRowKeys, onChange: (newSelectedRowKeys) => { setSelectedRowKeys(newSelectedRowKeys) } }
    const { FilterField, FilterValue } = filter
    const fFields = (FilterField ?? '').split(',')
    const fValues = (FilterValue ?? '').split(',')
    const fInject = (e) => {

        const idx = fFields.findIndex((el) => el === e.dataIndex)
        let title = `${e.title}`
        if (idx > -1) {
            const q = fValues[idx]
            const f = typeof q === 'string' && q.length > 0 && q.indexOf('|') !== -1 ? <CalendarOutlined /> : `${q}*`
            e.title = <span>
                <span>{title}: </span>
                <span style={{ color: '#1677ff' }} title={q}>{f}</span>
            </span>
        }
        return e

    }

    const columns = [
        {
            title: 'Tag ID',
            dataIndex: 'AssetRfid',
            ...getColumnSearchProps('AssetRfid'),
            sorter: (a, b) => a.AssetRfid?.length - b.AssetRfid?.length,
            sortDirections: ['descend', 'ascend'],
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} tag />,
            hidden: size < 5
        },
        {
            title: 'Serial',
            dataIndex: 'AssetSerial',
            ...getColumnSearchProps('AssetSerial'),
            render: (text, { AssetId, Description }) => <AssetPopover id={AssetId} text={text} description={Description} />,
        },
        {
            title: 'Type',
            dataIndex: 'AssetTypeName',
            ...getColumnSearchProps('AssetTypeName'),
            render: (text, { AssetTypeId }) => <Text className='vlink' delete={text[0] === '-'} onClick={() => geve.emit('gtype', { id: AssetTypeId, open: true })}>{text}</Text>
        },
        {
            title: 'Allocated User',
            dataIndex: 'PersonnelFirstName',
            ...getColumnSearchProps('PersonnelFirstName'),
            render: (text, { PersonnelNo, PersonnelFirstName, PersonnelLastName }) => <PersonPopover id={PersonnelNo} text={f(`${PersonnelFirstName ?? '-'} ${PersonnelLastName ?? ''}`)} />,
        },
        {
            title: 'Assigned User',
            dataIndex: 'AssignedUserFirstName',
            ...getColumnSearchProps('AssignedUserFirstName'),
            render: (text, { AssignedUserId, AssignedUserFirstName, AssignedUserLastName }) => <PersonPopover id={AssignedUserId} text={f(`${AssignedUserFirstName ?? '-'} ${AssignedUserLastName ?? ''}`)} />,
            hidden: size < 5
        },
        {
            title: 'Assigned Date',
            dataIndex: 'AssignedDate',
            ...getColumnSearchProps('AssignedDate'),
            render: d,
            hidden: size < 5
        },
        {
            title: 'Returned User',
            dataIndex: 'ReturnedUserFirstName',
            ...getColumnSearchProps('ReturnedUserFirstName'),
            render: (text, { ReturnedUserId, ReturnedUserFirstName, ReturnedUserLastName }) => <PersonPopover id={ReturnedUserId} text={f(`${ReturnedUserFirstName ?? '-'} ${ReturnedUserLastName ?? ''}`)} />,
            hidden: size <= 5
        },
        {
            title: 'Returned Date',
            dataIndex: 'ReturnedDate',
            // ...getColumnSearchProps('ReturnedDate'),
            filterMultiple: false,
            filters: [
                {
                    text: 'Assigned',
                    value: '[null]',
                },
                {
                    text: 'Returned',
                    value: '[notnull]',
                },
            ],
            render: d,
            hidden: size <= 5
        },
        {
            title: 'Duration',
            render: ({ AssignedDate, ReturnedDate }) => {
                if (AssignedDate && ReturnedDate) {
                    const a = moment(AssignedDate)
                    const r = moment(ReturnedDate)
                    return <Tag icon={<SwapOutlined />} color="green">{moment.duration(r.diff(a)).humanize()}</Tag>
                } else if (AssignedDate) {
                    const a = moment(AssignedDate)
                    return <Tag icon={<ClockCircleOutlined />} color="processing">{moment.duration(moment().diff(a)).humanize()}</Tag>
                } else {
                    return f('')
                }
            }
        },

        // ].filter(item => !item.hidden)
    ].filter(item => !item.hidden).map(fInject)

    return <div style={{ overflowX: 'auto' }}>
        {modalContextHolder}
        <Dropdown menu={{ items: ctxMenu }} trigger={['contextMenu']} >
            <div>
                <Table
                    loading={loading || Return.loading}
                    rowKey="Id"
                    className={'query_table'}
                    columns={columns}
                    dataSource={data.AssetAllocation ?? []}
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