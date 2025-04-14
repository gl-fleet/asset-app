import React from 'react'
import moment from 'moment'
import { Table, Tag } from 'antd'
import { UndoOutlined, CheckCircleOutlined, SwapOutlined, ClockCircleOutlined, BarcodeOutlined } from '@ant-design/icons'

import { f } from '../../../common/utils'

const _state = {
    Active: 'success',
    Lost: 'warning',
    Broken: 'error',
}

export default ({ data, loading }) => {

    const columns = [
        {
            title: 'Serial',
            dataIndex: 'AssetSerial',
            render: (text) => <Tag color={'geekblue'} icon={<BarcodeOutlined />}>{text}</Tag>,
        },
        {
            title: 'Type',
            dataIndex: 'AssetTypeName',
            render: f
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            render: (text) => <Tag color={_state[text ?? 'Active']}>{text ?? 'Active'}</Tag>,
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
                    return <Tag icon={<ClockCircleOutlined />} color="default">{moment.duration(moment().diff(a)).humanize()}</Tag>
                } else {
                    return f('')
                }
            }
        },
        {
            title: 'Action',
            render: ({ ReturnedDate }) => moment(ReturnedDate).isValid() ?
                <center><CheckCircleOutlined style={{ color: '#52c41a' }} /></center> :
                <center><UndoOutlined /></center>
        },
    ]

    return <Table
        loading={loading}
        rowKey="Id"
        className={'query_table'}
        columns={columns}
        dataSource={data.AssetAllocation ?? []}
        pagination={false}
        size="small"
        footer={null}
    />

}