import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Row, Col, Typography, Divider, Button, Tooltip, Space, Segmented } from 'antd'
import { PrinterOutlined, PlusOutlined, AreaChartOutlined, ToolOutlined, FileSearchOutlined } from '@ant-design/icons'
import { EventEmitter } from "events"
import styled from 'styled-components'

import Popup from './popup'
import Maintenance from './content'
import Inspection from './inspection'

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

    const [tab, setTab] = useState(location.hash ? location.hash : '#maintenance')
    const props = useMemo(() => ({ ...params, event: new EventEmitter() }), [])

    useEffect(() => {

        location.hash = tab

    }, [tab])

    return <LetMeWrap>

        <Row align="middle">

            <Col xs={24} lg={12} >
                {/* <RadiusUpleftOutlined style={{ color: '#1677ff' }} /> *}
                {/* <Text id="title" strong>Maintenance</Text> */}
                <Segmented
                    style={{ fontWeight: 'bold' }}
                    defaultValue={tab}
                    onChange={(e) => setTab(e)}
                    options={[
                        { label: 'Maintenance', value: '#maintenance', icon: <ToolOutlined /> },
                        { label: 'Inspection', value: '#inspection', icon: <FileSearchOutlined /> },
                    ]}
                />
            </Col>

            <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
                <Space wrap>

                    <Tooltip title="Report">
                        <Button disabled shape="circle" icon={<AreaChartOutlined />} />
                    </Tooltip>

                    <Tooltip title="Print">
                        <Button disabled shape="circle" icon={<PrinterOutlined />} />
                    </Tooltip>

                    <div>
                        <div style={{ display: tab === '#maintenance' ? 'block' : 'none' }}><Popup {...props} /></div>
                        {/* <div style={{ display: tab === 'inspection' ? 'block' : 'none' }}><Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => { props.event.emit('ins-pop', ['Create', null]) }} /></div> */}
                    </div>

                </Space>
            </Col>

        </Row>

        <Divider />

        <Row>
            <Col span={24}>

                {tab === '#maintenance' ? <Maintenance {...props} /> : null}
                {tab === '#inspection' ? <Inspection {...props} /> : null}

            </Col>
        </Row>

    </LetMeWrap>

}