import React, { useRef, useState, useEffect } from 'react'
import { Modal, Button, Input, Space, Table, Dropdown, Typography, Tag } from 'antd'
import { SearchOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'

import { KeyValue, PageSize, ErrorResponse, StatesColorMap, f, d, myAccess, iss } from '../../common/utils'
import PersonPopover from '../../common/popover/person'
import AssetPopover from '../../common/popover/asset'
import { useBridge } from '../../hooks/bridge'
import { useScreen } from '../../hooks/screen'

const { Text } = Typography

export default ({ event, geve }) => {

    const [{ get: { loading, data, error } }, { get: GetAssets, on, del }] = useBridge({ url: 'AssetCheckHistories' })
    const [filter, setFilter] = useState({ DepartmentId: Number(KeyValue('department') ?? '1'), Page: 1, PageSize, SortField: "Id", SortOrder: "desc" })
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [searchedColumn, setSearchedColumn] = useState('')
    const [modal, modalContextHolder] = Modal.useModal()
    const [searchText, setSearchText] = useState('')
    const [ctxMenu, setCtxMenu] = useState([])
    const searchInput = useRef(null)
    const size = useScreen()

    useEffect(() => { on((e) => e.payload === 'refetch' && GetAssets('refetch')) }, [])

    useEffect(() => {

        const findTR = (node, count = 8) => {

            if (node.nodeName === 'TR') return node
            if (count === 0) return null
            return findTR(node.parentNode, count - 1)

        }

        const select = (key) => setSelectedRowKeys((current) => {

            if (current.includes(Number(key))) return current
            return [Number(key)]

        })

        const edit = (key) => event.emit('popup.edit', key)

        const deleteConfirm = (key) => modal.confirm({
            title: `Are you sure delete this ${key}?`,
            icon: <DeleteOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => del(key, (is) => is === 'then' && GetAssets('refetch')),
        })

        const contextMenu = document.querySelector(".query_table")
        contextMenu.addEventListener("contextmenu", (e) => {

            e.preventDefault()
            const element = findTR(e.target)
            const key = element ? element.getAttribute('data-row-key') : null

            if (key === null) setCtxMenu([{ key: '1', type: 'group', label: `View page source` }])
            else {

                select(key)
                setCtxMenu([
                    {
                        key: key,
                        type: 'group',
                        label: `Selected key ${key}`,
                        disabled: true,
                        children: [
                            { key: '1-2', label: 'Edit', icon: <FormOutlined />, onClick: () => edit(key), disabled: !myAccess() },
                            { key: '1-3', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => deleteConfirm(key), disabled: true /* !myAccess() */ },
                        ],
                    },
                ])

            }

        })

    }, [])

    useEffect(() => { GetAssets(filter) }, [filter])

    /*** *** *** *** *** *** *** *** *** *** *** *** ***/

    const tableEvent = (pagination, filters, sorter, extra) => {

        let filterField = ''
        let filterValue = ''
        let once = true

        const fx = (n) => {
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

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            console.log('selectedRowKeys changed: ', newSelectedRowKeys)
            setSelectedRowKeys(newSelectedRowKeys)
        }
    }

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
            title: 'Tag ID',
            dataIndex: 'AssetRfid',
            ...getColumnSearchProps('AssetRfid'),
            sorter: (a, b) => a.AssetRfid.length - b.AssetRfid.length,
            sortDirections: ['descend', 'ascend'],
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} tag />,
            hidden: size < 5
        },
        {
            title: 'Serial',
            dataIndex: 'AssetSerial',
            ...getColumnSearchProps('AssetSerial'),
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} />
        },
        {
            title: 'Type',
            dataIndex: 'AssetTypeName',
            ...getColumnSearchProps('AssetTypeName'),
            render: (text, { AssetTypeId }) => <Text className='vlink' onClick={() => geve.emit('gtype', { id: AssetTypeId, open: true })}>{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            ...getColumnSearchProps('Status'),
            render: (text) => <Tag color={StatesColorMap[text]}>{text ?? '#'}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'Description',
            ...getColumnSearchProps('Description'),
            render: f,
            hidden: size < 3
        },
        {
            title: 'CheckedDate',
            dataIndex: 'CheckedDate',
            ...getColumnSearchProps('CheckedDate'),
            render: d,
            hidden: size < 5
        },
        {
            title: 'Checked User',
            ...getColumnSearchProps('CheckedUserFirstName'),
            render: (text, { CheckedUserId, CheckedUserFirstName, CheckedUserLastName }) => <PersonPopover id={CheckedUserId} text={f(`${CheckedUserFirstName ?? '-'} ${CheckedUserLastName ?? ''}`)} />,
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
                    rowKey="Id"
                    className={'query_table'}
                    columns={columns}
                    dataSource={data.AssetCheckHistory ?? []}
                    rowSelection={rowSelection}
                    pagination={{ pageSize: filter.PageSize, total: data.PageCount * filter.PageSize }}
                    onChange={tableEvent}
                    bordered={true}
                    size="small"
                />
                <ErrorResponse error={error} extra={<br />} />
            </div>
        </Dropdown>
    </div>

}