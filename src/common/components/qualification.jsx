import moment from 'moment'
import styled from 'styled-components'
import React, { useEffect } from "react"
import { Card, Col, Row, Skeleton, Typography, Empty } from 'antd'
import { CheckCircleOutlined, ExpandAltOutlined, ClockCircleOutlined } from '@ant-design/icons'

import { useBridge } from '../../hooks/bridge'
import { df } from '../utils'

const { Paragraph, Text } = Typography

const Wrap = styled.section`
    .ant-card-head {
        min-height: 28px;
    }
    .ant-card-body {
        padding-bottom: 0px;
        padding-top: 4px;
    }
    .ant-typography {
        margin-bottom: 4px;
    }
`

export default ({ geve = null, PersonnelNo, span = 8 }) => {

    const [{ get: { loading, data } }, { get }] = useBridge({ url: 'Qualifications/GetPersonnelQualifications' })

    const items = (data?.personnel?.[0]?.attendances ?? [])

    useEffect(() => { PersonnelNo > 0 && get({ PersonnelNo }) }, [PersonnelNo])
    /* useEffect(() => {

        if (loading === false) {

            for (const e of items) {

                const isValid = Math.round((moment(e.QualificationEnd) - moment().startOf('day')) / 86400000) > 0
                e.QualificationCode === 31369817 && geve && geve.emit('on-guide-verified', isValid ? 'Qualified' : null)

            }

        }

    }, [loading]) */

    if (loading) return <Skeleton active />
    if (Array.isArray(items) && items.length > 0) return <Wrap>
        <Row gutter={[8, 8]}>
            {items.map((e) => {

                const isValid = Math.round((moment(e.QualificationEnd) - moment().startOf('day')) / 86400000) > 0

                return <Col span={span} key={e.QualificationCode}>

                    <Card
                        title={<Text strong type={isValid ? 'success' : 'danger'}>{e.QualificationEnd === null ? 'Not Attended' : moment(e.QualificationEnd).format(df)}</Text>}
                        extra={isValid ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: 'red' }} />}
                        size="small"
                    >
                        <Paragraph strong ellipsis={{ rows: 1, expandable: true, symbol: <ExpandAltOutlined /> }}>
                            {e.QualificationDesc}
                        </Paragraph>
                    </Card>

                </Col>

            })}
        </Row>
    </Wrap>
    else return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />

}