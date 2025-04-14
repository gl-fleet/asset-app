import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Row, Col, Typography, Divider, Button, Tooltip, Space, Skeleton, message } from 'antd'
import { PrinterOutlined, RadiusUpleftOutlined, AreaChartOutlined, FolderAddOutlined } from '@ant-design/icons'
import { EventEmitter } from "events"
import styled from 'styled-components'

import Content from './content'
import Popuup from './popup'

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

const CustomHeader = ({ event }) => {

    const [total, setTotal] = useState('*')

    const name = useMemo(() => location.hash.replace('#', '').replaceAll('_', ' '), [location.hash])

    useEffect(() => {

        const asset_total = (e) => typeof e === 'number' && !isNaN(e) && setTotal(e)
        event.on('asset-total', asset_total)
        return () => event.off('asset-total', asset_total)

    }, [])

    return <Col xs={24} lg={12} >
        <RadiusUpleftOutlined style={{ color: '#1677ff' }} />
        <Text id="title" strong>{name || 'Assets'}:</Text>
        <Text id="title" strong>{total}</Text>
    </Col>

}

export default (params) => {

    const [messageApi, contextHolder] = message.useMessage()

    const [loading, setLoading] = useState(true)
    const event = useRef(new EventEmitter())
    const ref = useRef(null)
    const ref1 = useRef(null)
    const ref2 = useRef(null)

    const props = {
        ...params,
        message: messageApi,
        io: ref.current,
        event: event.current,
    }

    useEffect(() => {

        setLoading(false)

        return () => {
            ref.current = null
            ref1.current = null
            ref2.current = null
        }

    }, [])

    return loading ? null : <LetMeWrap>

        {contextHolder}

        <Row align="middle">

            <CustomHeader event={props.event} />

            <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
                <Space wrap>

                    <Tooltip title="Report">
                        <Button disabled shape="circle" icon={<AreaChartOutlined />} />
                    </Tooltip>

                    <Tooltip title="Print">
                        <Button disabled shape="circle" icon={<PrinterOutlined />} />
                    </Tooltip>

                    <div>
                        <Popuup {...props} pRef={ref1} />
                    </div>

                </Space>
            </Col>

        </Row>

        <Divider />

        <Row>
            <Col span={24}>
                <Content {...props} />
            </Col>
        </Row>

    </LetMeWrap>

}