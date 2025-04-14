import Highlighter from 'react-highlight-words'
import React, { useRef, useState, useEffect } from 'react'
import { Button, Input, Space, Table, Dropdown } from 'antd'
import { SearchOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons'

import { PageSize, ErrorResponse, f, iss } from '../../common/utils'
import PersonPopover from '../../common/popover/person'
import { useBridge } from '../../hooks/bridge'
import { useScreen } from '../../hooks/screen'

export default (_) => {

    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'Personnels' })
    const [filter, setFilter] = useState({ Page: 1, PageSize })
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [searchedColumn, setSearchedColumn] = useState('')
    const [searchText, setSearchText] = useState('')
    const [ctxMenu, setCtxMenu] = useState([])
    const searchInput = useRef(null)
    const size = useScreen()

    useEffect(() => get(filter), [filter])

    useEffect(() => {

        const findTR = (node, count = 8) => {

            if (node.nodeName === 'TR') return node
            if (count === 0) return null
            return findTR(node.parentNode, count - 1)

        }

        const contextMenu = document.querySelector(".query_table")
        contextMenu.addEventListener("contextmenu", (e) => {

            e.preventDefault()

            const element = findTR(e.target)
            const key = element ? element.getAttribute('data-row-key') : null

            if (key === null) setCtxMenu([{ key: '1', type: 'group', label: `View page source` }])
            else {

                setSelectedRowKeys((current) => {
                    if (current.includes(key)) return current
                    return [key] /* Should select one */
                })

                const sap = typeof key === 'string' && key.length > 5 ? key.split('_')[0] : key

                setCtxMenu([
                    {
                        key: key,
                        type: 'group',
                        label: `Selected key ${sap}`,
                        disabled: true,
                        children: [
                            { key: '1-2', label: "Edit", icon: <FormOutlined />, onClick: () => _.geve.emit('gperson', { id: key }) },
                            { key: '1-3', label: 'Delete', icon: <DeleteOutlined />, danger: true, disabled: true },
                        ],
                    },
                ])

            }

        })

    }, [])

    const tableEvent = (pagination, filters, sorter, extra) => {

        let filterField = ''
        let filterValue = ''
        let once = true

        Object.keys(filters).forEach((field) => {
            if (filters[field] !== null) {
                filterField += `${once ? '' : ','}${field}`
                filterValue += `${once ? '' : ','}${filters[field][0]}`
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
        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys)
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
            title: 'SAP',
            dataIndex: 'PersonnelNo',
            ...getColumnSearchProps('PersonnelNo'),
            sorter: (a, b) => a.PersonnelNo.length - b.PersonnelNo.length,
            sortDirections: ['descend', 'ascend'],
            render: (text) => <PersonPopover id={text} />,
        },
        {
            title: 'First Name',
            dataIndex: 'FirstName',
            ...getColumnSearchProps('FirstName'),
            render: (text, { PersonnelNo }) => <PersonPopover id={PersonnelNo} text={f(text)} />,
        },
        {
            title: 'Last Name',
            dataIndex: 'LastName',
            ...getColumnSearchProps('LastName'),
            render: (text, { PersonnelNo }) => <PersonPopover id={PersonnelNo} text={f(text)} />,
        },
        {
            title: 'Job',
            dataIndex: 'PositionDesc',
            ...getColumnSearchProps('PositionDesc'),
            render: f,
            hidden: size < 5
        },
        {
            title: 'Department',
            dataIndex: 'DepartmentDesc',
            ...getColumnSearchProps('DepartmentDesc'),
            render: f,
            hidden: size < 5
        },
        {
            title: 'Company',
            dataIndex: 'CompanyDesc',
            ...getColumnSearchProps('CompanyDesc'),
            render: f,
            hidden: size < 5
        },
        {
            title: 'Mobile',
            dataIndex: 'ContactNumber',
            ...getColumnSearchProps('ContactNumber'),
            render: f,
            hidden: size < 5
        },
        /* {
            title: 'Work Phone',
            dataIndex: 'WorkPhone',
            ...getColumnSearchProps('WorkPhone'),
            render: f,
            hidden: size < 3
        }, */
    ].filter(item => !item.hidden).map(fInject)

    return <div style={{ overflowX: 'auto' }}>
        <Dropdown menu={{ items: ctxMenu }} trigger={['contextMenu']} >
            <div>
                <Table
                    loading={loading}
                    // rowKey="PersonnelNo_PersonnelId"
                    rowKey={record => `${record.PersonnelId}_${record.PersonnelNo}`}
                    className={'query_table'}
                    rowClassName={''}
                    columns={columns}
                    dataSource={data?.Personnel ?? []}
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