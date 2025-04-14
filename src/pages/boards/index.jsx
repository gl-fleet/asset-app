import React from 'react'
import { Divider, Col, Typography } from 'antd'
import styled from 'styled-components'

import { RadiusUpleftOutlined } from '@ant-design/icons'

import AllocationBoard from './allocation'

const { Text } = Typography

const LetMeWrap = styled.section`
    #title {
        font-size: 18px;
        padding-left: 6px;
    }
    .ant-menu-overflow {
        border-bottom: none;
    }
`

export default () => {

    return <LetMeWrap>

        <Col xs={24} lg={12} >
            <RadiusUpleftOutlined style={{ color: '#1677ff' }} />
            <Text id="title" strong>Allocation status</Text>
        </Col>

        <br />

        <AllocationBoard />

    </LetMeWrap>

}