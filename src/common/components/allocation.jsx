import moment from 'moment'
import styled from 'styled-components'
import React, { useEffect, useState, useRef } from "react"
import { ClockCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { Grid, Table, Tag } from 'antd'

import { ErrorResponse, kv, PageSize, f, d, iss } from '../utils'
import AssetPopover from '../../common/popover/asset'
import PersonPopover from '../../common/popover/person'
import { useBridge } from '../../hooks/bridge'

const { useBreakpoint } = Grid

const Wrap = styled.section`
    .ant-card-body {
        padding-bottom: 0px;
    }
`

export default ({ active = true, filter: query }) => {

    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'AssetAllocations' })
    const [filter, setFilter] = useState({ DepartmentId: Number(kv('department', ['1'])), Page: 1, PageSize, SortField: "Id", SortOrder: "desc", MaxDays: 30 * 12, ...query })
    const screens = useBreakpoint()

    useEffect(() => {

        const temp = { ...query, ...filter }
        get(temp)

    }, [JSON.stringify({ ...query, ...filter })])

    const tableEvent = (pagination, filters, sorter) => {

        /* let filterField = ''
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
        })) */

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

        setFilter((e) => {

            const temp = {
                ...e,
                Page: pagination.current ?? e.Page,
                PageSize: pagination.pageSize ?? e.PageSize,
                FilterField: iss(filterField) ? filterField : e.FilterField,
                FilterValue: iss(filterValue) ? filterValue : e.FilterValue,
                SortField: iss(sorter.field) ? sorter.field : e.SortField,
                ...(typeof sorter.order === 'string' && ['descend', 'ascend'].includes(sorter.order)) ? { SortOrder: sorter.order === 'descend' ? 'desc' : 'asc' } : { SortOrder: 'desc' }
            }

            return temp

        })

    }

    const columns = [
        {
            title: 'Tag ID',
            dataIndex: 'AssetRfid',
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} tag />,
        },
        {
            title: 'Serial',
            dataIndex: 'AssetSerial',
            hidden: !screens.xxl,
            render: (text, { AssetId }) => <AssetPopover id={AssetId} text={text} />
        },
        {
            title: 'Type',
            dataIndex: 'AssetTypeName',
            render: f
        },
        {
            title: 'Allocated User',
            dataIndex: 'PersonnelFirstName',
            render: (text, { PersonnelNo, PersonnelFirstName, PersonnelLastName }) => <PersonPopover id={PersonnelNo} text={f(`${PersonnelFirstName ?? '-'} ${PersonnelLastName ?? ''}`)} />,
        },
        {
            title: 'Assigned User',
            dataIndex: 'AssignedUserFirstName',
            hidden: !screens.xxl,
            render: (text, { AssignedUserId, AssignedUserFirstName, AssignedUserLastName }) => <PersonPopover id={AssignedUserId} text={f(`${AssignedUserFirstName ?? '-'} ${AssignedUserLastName ?? ''}`)} />,
        },
        {
            title: 'Assigned Date',
            dataIndex: 'AssignedDate',
            sorter: (a, b) => moment(a.AssignedDate) - moment(b.AssignedDate),
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
            render: d
        },
        {
            title: 'Returned User',
            dataIndex: 'ReturnedUserFirstName',
            hidden: !screens.xxl,
            render: (text, { ReturnedUserId, ReturnedUserFirstName, ReturnedUserLastName }) => <PersonPopover id={ReturnedUserId} text={f(`${ReturnedUserFirstName ?? '-'} ${ReturnedUserLastName ?? ''}`)} />,
        },
        {
            title: 'Returned Date',
            dataIndex: 'ReturnedDate',
            render: d
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
                dataSource={data.AssetAllocation ?? []}
                onChange={tableEvent}
            />
            <ErrorResponse error={error} extra={<br />} />

        </Wrap>

    } else return null

}