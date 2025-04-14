import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Typography, Badge, Card, Avatar, Layout, Spin } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import styled, { createGlobalStyle } from 'styled-components'
import { useTranslation } from "react-i18next"

import NonReturnableList from '../../../common/components/nonreturnable'
import Qualification from '../../../common/components/qualification'
import { Broadcast, Sfy, KeyValue, isSecure } from '../../../common/utils'
import { useBridge } from '../../../hooks/bridge'
import ViewLeft from './lview'

const { Content } = Layout
const { Title } = Typography

const GlobalStyle = createGlobalStyle`
    .ant-float-btn-group {
        opacity: 0;
    }
`
const LetMeWrap = styled.section`
    display: table;
    height: 100%;
    max-width: 1440px;
    margin: auto;
    #title {
        font-size: 18px;
        padding-left: 6px;
    }
    .query_table {
        cursor: context-menu;
    }
    .ant-card-meta-detail {
        align-self: center;
    }
    .ant-table-thead {
        display: none;
    }
    .access-check h5 {
        margin-top: 8px;
        margin-bottom: -4px;
    }
    .special-items h5 {
        margin-top: 8px;
        margin-bottom: -4px;
    }
    h5 {
        font-weight: 800;
    }
    #profile {
        text-align: center;
    }
    #profile h2 {
        font-weight: 800;
        text-transform: uppercase;
        margin: 4px 0px 22px 0px;
    }
`

export default () => {

    let [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'ImsIntegration' })

    const { i18n } = useTranslation()
    const [id, setId] = useState([0, 0])
    const [toggle, setToggle] = useState(false)
    const [assets, setAssets] = useState({ type: '', loading: false, data: {}, error: [] })

    const EN = useMemo(() => i18n.getDataByLanguage('EN').translation, [])
    const MN = useMemo(() => i18n.getDataByLanguage('MN').translation, [])

    const t = (key) => `${MN[key]} / ${EN[key]}`

    const iconSize = 64
    const gridStyleC = { width: '50%', textAlign: 'center' }

    useEffect(() => {

        let PersonnelId = 0
        let PersonnelNo = 0

        new Broadcast('logs', (value) => {

            if (value.type === 'profile') {

                [PersonnelId, PersonnelNo] = value.value.split('_')
                setId([Number(PersonnelId), Number(PersonnelNo)])
                get({ sap: PersonnelNo }) // pull_info(value.value)

            }

            if (value.type === 'person_asset') {
                setAssets(value)
                get({ sap: PersonnelNo }) // pull_info(value.value)
            }

            if (value.type === 'alloc_assign') {
                setAssign(value)
            }

            if (value.type === 'clearScreen' && value.t === 0) {
                window.location.reload()
            }

        })

    }, [])

    const access_icon = (isOk) => {

        const _true = typeof isOk !== 'undefined' && isOk === true
        const style = {
            background: 'transparent',
            border: '2px solid',
            borderColor: _true ? '#5b8c00' : '#a8071a',
            color: _true ? '#5b8c00' : '#a8071a',
        }
        if (_true) return <Avatar icon={<CheckOutlined />} size={iconSize} style={{ ...style }} />
        else return <Avatar icon={<CloseOutlined />} size={iconSize} style={{ ...style }} />

    }

    const accessCheckSize = 5

    const person = {
        loading,
        data: {
            ...data,
            ...(data['UgAccessAllocation'] ?? {}),
            Face: data.Face ?? (data['UgAccessAllocation'] ?? {}).Face ?? ''
        }
    }

    return (
        <LetMeWrap>
            <GlobalStyle />
            <Layout style={{ maxWidth: 1440, margin: 'auto', display: "table-cell", verticalAlign: 'middle ' }}>

                <Content style={{ padding: 8 }}>

                    <Spin spinning={person.loading}>
                        <Card>

                            <div id="profile">
                                <Avatar src={person.data.Face ? `data:image/png;base64,${person.data.Face ?? ''}` : null} size={96} />
                                <h2>{`${person.data.FirstName ?? "***"} ${person.data.LastName ?? "***"}`} ({`${person.data.SAP ?? "***"}`})</h2>
                            </div>

                            <Row gutter={24}>

                                <Col span={14}>

                                    <Card title={t('issue_return')} size="small">

                                        {toggle ? null : <ViewLeft {...assets} />}

                                    </Card>

                                    <br />
                                    {toggle ? null : <NonReturnableList title={t('special_items')} viewOnly={false} PersonnelId={id[0]} PersonnelNo={id[1]} size='small' />}

                                    <br />
                                    {toggle ? null : <Qualification PersonnelNo={id[1]} />}

                                </Col>

                                <Col span={10}>
                                    <Badge.Ribbon text={person.data.AccessGrantedNote ?? "***"} color="orange">
                                        <Card title={t('access_check')} className='access-check' size="small">

                                            <Card.Grid style={gridStyleC}>
                                                {access_icon(person.data.Attendances?.OtInduction)}
                                                <Title level={accessCheckSize}>UG INDUCTION</Title>
                                            </Card.Grid>

                                            <Card.Grid style={gridStyleC}>
                                                {access_icon(person.data.Pli)}
                                                <Title level={accessCheckSize}>PLI TAG</Title>
                                            </Card.Grid>

                                            <Card.Grid style={gridStyleC}>
                                                {access_icon(person.data.Attendances?.RcInduction)}
                                                <Title level={accessCheckSize}>RC INDUCTION</Title>
                                            </Card.Grid>

                                            <Card.Grid style={gridStyleC}>
                                                {access_icon(person.data.TopVu)}
                                                <Title level={accessCheckSize}>MINE ID</Title>
                                            </Card.Grid>

                                            <Card.Grid style={gridStyleC}>
                                                {access_icon(person.data.Attendances?.UgAlz)}
                                                <Title level={accessCheckSize}>ALZ INDUCTION</Title>
                                            </Card.Grid>

                                            <Card.Grid style={gridStyleC}>
                                                {access_icon(person.data.hasOwnProperty('Blacklist') ? !(person.data.Blacklist) : false)}
                                                <Title level={accessCheckSize}>NOT BLOCKED</Title>
                                            </Card.Grid>

                                        </Card>
                                    </Badge.Ribbon>
                                </Col>

                            </Row>

                        </Card>
                    </Spin>

                </Content>
            </Layout>
        </LetMeWrap>
    )

}