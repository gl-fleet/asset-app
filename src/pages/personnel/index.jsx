import React from 'react'
import { Row, Col, Typography, Divider, Button, Tooltip, Space } from 'antd'
import { AreaChartOutlined, PrinterOutlined, RadiusUpleftOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import Content from './content'

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
export default (_) => {

    return <LetMeWrap>

        <Row align="middle">
            <Col xs={24} lg={12} >
                <RadiusUpleftOutlined style={{ color: '#1677ff' }} />
                <Text id="title" strong>Personnel</Text>
            </Col>
            <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
                <Space wrap>

                    <Tooltip title="Report">
                        <Button disabled shape="circle" icon={<AreaChartOutlined />} />
                    </Tooltip>

                    <Tooltip title="Print">
                        <Button disabled shape="circle" icon={<PrinterOutlined />} />
                    </Tooltip>

                </Space>
            </Col>
        </Row>

        <Divider />

        <Row>
            <Col span={24}>
                <Content {..._} />
            </Col>
        </Row>

    </LetMeWrap>

}