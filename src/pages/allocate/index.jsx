import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Typography, Divider, Button, Tooltip, Space, message } from 'antd'
import { PrinterOutlined, RadiusUpleftOutlined, AreaChartOutlined, DesktopOutlined } from '@ant-design/icons'
import { EventEmitter } from "events"
import styled from 'styled-components'

import AllocationBoard from '../boards/allocation'
import Content from './content'
import Assign from './assign'

const { Text } = Typography

const LetMeWrap = styled.section`
    #title {
        font-size: 18px;
        padding-left: 6px;
    }
    .query_table {
        cursor: context-menu;
    }
`

export default (params) => {

    const [messageApi, contextHolder] = message.useMessage()

    const [loading, setLoading] = useState(true)
    const event = useRef(new EventEmitter())
    const ref = useRef(null)
    const ref1 = useRef(null)

    const props = {
        ...params,
        message: messageApi,
        io: ref.current,
        event: event.current,
    }

    useEffect(() => { setLoading(false) }, [])

    return loading ? null : <LetMeWrap>

        {contextHolder}

        <Row align="middle">

            <Col xs={24} lg={12} >
                <RadiusUpleftOutlined style={{ color: '#1677ff' }} />
                <Text id="title" strong>Issue/Return</Text>
            </Col>

            <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
                <Space wrap>

                    <Tooltip title="Report">
                        <Button disabled shape="circle" icon={<AreaChartOutlined />} />
                    </Tooltip>

                    <Tooltip title="Print">
                        <Button disabled shape="circle" icon={<PrinterOutlined />} />
                    </Tooltip>

                    <Tooltip title="Allocation Process">
                        <Button shape="circle" target='_blank' href="/boards/allocation" key="board" icon={<DesktopOutlined />} />
                    </Tooltip>

                    <Assign {...props} pRef={ref1} />

                </Space>
            </Col>

        </Row>

        <Divider />

        <Row>

            <Col span={24}>
                <div style={{ paddingBottom: 16 }}>
                    <AllocationBoard />
                </div>
                <Content {...props} />
            </Col>
        </Row>

    </LetMeWrap>

}