import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Button, Input, Space, Table, Dropdown, Typography, Tag, Badge } from 'antd'
import { FormOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'

import { KeyValue, PageSize, ErrorResponse, StatesColorMap, f, d, myAccess, inspection_list } from '../../../common/utils'
import PersonPopover from '../../../common/popover/person'
import AssetPopover from '../../../common/popover/asset'
import { useBridge } from '../../../hooks/bridge'

import InspectionPopup from './popup'

const { Text } = Typography

export const Expanding = ({ event, Id }) => {

    const [{ get }, { get: _get, on: _on }] = useBridge({ url: 'AssetInspectionHistory', get: [] })

    const ins_obj = useMemo(() => {

        const obj = {}
        for (const x of inspection_list) {
            const [k, v] = x.split('.')
            obj[Number(k)] = v
        }

        return obj

    }, [])

    const list = useMemo(() => ({ ready: !get.loading, data: get.data ?? [] }), [get.loading])

    const expandColumns = [
        {
            title: 'Name', dataIndex: 'name',
            render: (e, { CheckTypeId }) => <Tag>{ins_obj[CheckTypeId]}</Tag>
        },
        {
            title: 'Status',
            key: 'state',
            render: () => <Badge status="success" text="On-Time" />,
        },
        { title: 'Description', dataIndex: 'Description' },
        { title: 'Checked at', dataIndex: 'CheckedDateTime', render: d },
        { title: 'Modified User', dataIndex: 'CheckedUserId', render: (e) => <PersonPopover id={e ?? 0} /> },
        {
            title: 'Action(s)',
            key: 'operation',
            render: ({ Id: id }) => (
                <Space size="middle">
                    <a onClick={() => event.emit('ins-pop', ['Edit', id])}><FormOutlined /></a>
                    <a disabled><DeleteOutlined /></a>
                </Space>
            ),
        },
    ]

    useEffect(() => { _get({ AssetId: Id }) }, [Id])

    useEffect(() => { _on(({ payload, to }) => to === 'AssetInspectionHistory' && payload === 'refetch' && _get('refetch')) }, [])

    return <Table
        rowKey={e => `child_${e.Id}`}
        columns={expandColumns}
        dataSource={list.data}
        size='small'
    />

}

export default ({ event, geve }) => {

    const [{ get: getAssets }, { get: _getAssets }] = useBridge({ url: 'Assets' })
    const [{ get, set, del }, { get: _get, set: _set, del: _del }] = useBridge({ url: 'AssetInspectionHistory' })

    const [filter, setFilter] = useState({ DepartmentId: Number(KeyValue('department') ?? '1'), Page: 1, PageSize, SortField: "Id", SortOrder: "desc" })
    const [searchedColumn, setSearchedColumn] = useState('')
    const [searchText, setSearchText] = useState('')
    const [ctxMenu, setCtxMenu] = useState({})
    const searchInput = useRef(null)

    useEffect(() => { _getAssets({ ...filter }) }, [filter])

    const list = useMemo(() => ({
        ready: !getAssets.loading,
        data: getAssets.data?.Asset ?? [],
        size: getAssets.data?.PageCount ?? 0,
    }), [getAssets.loading])

    useEffect(() => {

        document.querySelector(".query_table").addEventListener("contextmenu", (e) => {

            e.preventDefault()

            const findTR = (node, count = 8) => {

                if (node.nodeName === 'TR') return node
                if (count === 0) return null
                return findTR(node.parentNode, count - 1)

            }

            const element = findTR(e.target)
            const key = element ? element.getAttribute('data-row-key') : null
            const isChild = typeof key === 'string' && key.indexOf('child') === 0

            if (key === null) setCtxMenu({ key: '1', type: 'group', label: `View page source` })
            else setCtxMenu({
                key: key,
                type: 'group',
                label: `Selected key ${key}`,
                disabled: true,
                children: [
                    { key: '1-1', label: isChild ? 'Edit' : 'Add', icon: <FormOutlined />, onClick: () => edit(key), disabled: !myAccess() },
                    { key: '1-2', label: 'Delete', icon: <DeleteOutlined />, onClick: () => remove(key), disabled: true, danger: true },
                ],
            })

        })

    }, [])

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
    }

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
            FilterField: filterField ?? e.FilterField,
            FilterValue: filterValue ?? e.FilterValue,
            SortField: sorter.field ?? e.SortField,
            ...(typeof sorter.order === 'string' && ['descend', 'ascend'].includes(sorter.order)) ? { SortOrder: sorter.order === 'descend' ? 'desc' : 'asc' } : { SortOrder: 'desc' }
        }))

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

    const columns = [
        {
            title: 'Tag ID', dataIndex: 'Rfid',
            ...getColumnSearchProps('Rfid'),
            render: (text, { Id }) => <AssetPopover id={Id} text={text} tag />,
        },
        {
            title: 'Serial', dataIndex: 'Serial',
            ...getColumnSearchProps('Serial'),
            render: (text, { Id }) => <AssetPopover id={Id} text={text} />,
        },
        {
            title: 'Type', dataIndex: 'TypeName',
            ...getColumnSearchProps('TypeName'),
            render: (text, { AssetTypeId }) => <Text className='vlink' onClick={() => geve.emit('gtype', { id: AssetTypeId, open: true })}>{text}</Text>,
        },
        {
            title: 'Status', dataIndex: 'Status',
            render: (text) => <Tag color={StatesColorMap[text ?? 'Active']}>{text ?? 'Active'}</Tag>,
        },
        {
            title: 'Mfg. Date', dataIndex: 'ManufacturedDate',
            render: d,
        },
        {
            title: 'Started Using Date', dataIndex: 'StartedUsingDate',
            render: d,
        },
        {
            title: 'Modified User', key: 'ModifiedUserName',
            render: (text, { ModifiedUserId, ModifiedUserName }) => ModifiedUserId === 0 ? <PersonPopover id={0} /> : <PersonPopover id={ModifiedUserId} text={f(ModifiedUserName)} />,
        },
    ]

    const expandedRowRender = ({ Id }) => <Expanding event={event} Id={Id} />

    const edit = (key) => {

        if (typeof key === 'string') {

            const id = Number(key.split('_')[1])
            if (key.indexOf('parent') === 0) event.emit('ins-pop', ['Create', id])
            if (key.indexOf('child') === 0) event.emit('ins-pop', ['Edit', id])

        }

    }

    const remove = (key) => { }

    return <>
        <InspectionPopup event={event} />
        <Dropdown menu={{ items: [ctxMenu] }} trigger={['contextMenu']} >
            <div>
                <Table
                    className={'query_table'}
                    rowKey={e => `parent_${e.Id}`}
                    columns={columns}
                    expandable={{ expandedRowRender }}
                    dataSource={list.data}
                    size="small"
                    onChange={tableEvent}
                    // pagination={{ pageSize: 15 }}
                    pagination={{ pageSize: filter.PageSize, total: list.size * filter.PageSize }}
                />
            </div>
        </Dropdown>
    </>

}