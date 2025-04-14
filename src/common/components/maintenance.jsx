import moment from 'moment'
import { Table, Tag } from 'antd'
import styled from 'styled-components'
import React, { useEffect, useState } from "react"

import { ErrorResponse, KeyValue, PageSize, f, d, StatesColorMap } from '../utils'
import { useBridge } from '../../hooks/bridge'
import AssetPopover from '../popover/asset'
import PersonPopover from '../popover/person'

const Wrap = styled.section`
    .ant-card-body {
        padding-bottom: 0px;
    }
`

export default ({ active = true, filter: query }) => {

    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'AssetCheckHistories' })
    const [filter, setFilter] = useState({ DepartmentId: Number(KeyValue('department') ?? '1'), Page: 1, PageSize, SortField: "Id", SortOrder: "desc" })

    useEffect(() => { get({ ...query, ...filter }) }, [JSON.stringify({ ...query, ...filter })])

    const tableEvent = (pagination, filters, sorter) => {

        let filterField = ''
        let filterValue = ''

        Object.keys(filters).forEach((field) => {
            if (filters[field] !== null) {
                filterField = field
                filterValue = filters[field][0]
            }
        })

        setFilter((e) => ({
            ...e,
            Page: pagination.current ?? e.Page,
            PageSize: pagination.pageSize ?? e.PageSize,
            FilterField: filterField ?? e.FilterField,
            FilterValue: filterValue ?? e.FilterValue,
            SortField: sorter.field ?? e.SortField,
            ...(typeof sorter.order === 'string' && ['descend', 'ascend'].includes(sorter.order)) ?
                { SortOrder: sorter.order === 'descend' ? 'desc' : 'asc' } : { SortOrder: undefined }
        }))

    }

    const _state = {
        Active: 'success',
        Lost: 'warning',
        Broken: 'error',
    }

    const columns = [
        {
            title: 'Tag ID',
            dataIndex: 'AssetRfid',
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} tag />
        },
        {
            title: 'Serial',
            dataIndex: 'AssetSerial',
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} />
        },
        {
            title: 'Type',
            dataIndex: 'AssetTypeName',
            render: (text) => <Tag color={'blue'}>{text ?? '#'}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            // render: (text) => <Tag color={_state[text]}>{text ?? '#'}</Tag>
            render: (text) => <Tag color={StatesColorMap[text]}>{text ?? '#'}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'Description',
            render: f
        },
        {
            title: 'CheckedDate',
            dataIndex: 'CheckedDate',
            sorter: (a, b) => moment(a.CheckedDate) - moment(b.CheckedDate),
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
            render: d
        },
        {
            title: 'Checked User',
            render: (text, { CheckedUserId, CheckedUserFirstName, CheckedUserLastName }) => <PersonPopover id={CheckedUserId} text={f(`${CheckedUserFirstName ?? '-'} ${CheckedUserLastName ?? ''}`)} />,
        },

    ].filter(item => !item.hidden)

    if (active) {

        return <Wrap>

            <Table
                rowKey="Id"
                size="small"
                bordered={true}
                className={'query_table'}
                loading={loading}
                columns={columns}
                pagination={{ pageSize: filter.PageSize, total: data.PageCount * filter.PageSize }}
                dataSource={data.AssetCheckHistory ?? []}
                onChange={tableEvent}
            />
            <ErrorResponse error={error} extra={<br />} />

        </Wrap>

    } else return null

}