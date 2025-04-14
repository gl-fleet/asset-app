import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Row, Col, Card, Statistic, Tag, Skeleton, Space, theme, Collapse, Divider, Badge } from 'antd'
import { RetweetOutlined, ApiOutlined, UserSwitchOutlined, TagsOutlined } from '@ant-design/icons'
import * as signalR from "@microsoft/signalr"
import styled from 'styled-components'
import AnimatedNumber from "react-animated-numbers"
import { useNavigate, useLocation } from "react-router-dom"
import queryString from 'query-string'
import moment from 'moment'

import { dateFormat, Delay, KeyValue, kv, env } from '../../common/utils'
import { Sun, Moon } from '../../common/svgs'

const LetMeWrap = styled.section`
    .ant-menu-overflow {
        border-bottom: none;
    }
    .ant-collapse-header-text {
        padding-left: 4px !important;
    }
    .ant-collapse-extra {
        margin-right: -12px !important;
    }
`

const { useToken } = theme

export default () => {

    const [items, setItems] = useState({})
    const [status, setStatus] = useState(1)
    const navigate = useNavigate()
    const { token } = useToken()
    const isSocketOn = useMemo(() => kv('iSocket', ['On']) === 'On', [])
    const obj = useRef({})
    const ttl = useRef({ asset: 0, person: 0 })
    const loc = useLocation()

    useEffect(() => {

        if (isSocketOn === false) {
            setStatus(3)
            return
        }

        /** Declaration */
        let shouldReconnect = true
        const _ttl = { asset: 0, person: 0 }

        const fill = (ls) => {

            for (const x of ls) {
                try {

                    const { Date, Shift, Name, Count } = x
                    const key = `${Date}_${Shift}_${Name}`

                    _ttl.asset += Number(Count)
                    _ttl.person += Number(Count) / 2

                    if (obj.current.hasOwnProperty(key)) /** Update asset **/ {

                        obj.current[key].Count += Number(Count)

                    } else /** Create asset **/ {

                        obj.current[key] = { ...x, Title: `${moment(Date).format('YYYY/MM/DD')} ${Shift === "Night" ? '16:00-04:00' : '04:00-16:00'} (${Shift === "Night" ? 'Night shift' : 'Day shift'})` }

                    }

                } catch (err) { console.log(`PPE Monitoring dashboard: ${err.message}`) }
            }

            const t = {}

            for (const key in obj.current) {

                const { Title } = obj.current[key]
                if (!t.hasOwnProperty(Title)) t[Title] = []
                t[Title].push(obj.current[key])

            }

            ttl.current = _ttl

            setItems({ ...t })

        }

        /** Websocket Initiation */
        const ws = new signalR.HubConnectionBuilder()
            .withUrl(`${env.API}/SignalR`, { skipNegotiation: true, transport: 1 })
            .configureLogging(signalR.LogLevel.None)
            .build()

        /** Listen events from Server */
        ws.on(`AssetAllocated-${Number(KeyValue('department') ?? '1')}`, (u) => fill([u]))

        /** Websocket Starter */
        const start = async () => {
            try {

                if (!shouldReconnect) return ':('

                await ws.start()
                const e = await ws.invoke("GetAllocationSummary", Number(KeyValue('department') ?? '1'))
                const ls = e?.Data?.Dashboard ?? []
                // console.log(`ws:Connected {data: ${ls.length}}`)
                obj.current = {}
                ttl.current = { asset: 0, person: 0 }
                fill(ls)
                setStatus(0)

            } catch (err) {

                console.error(`Websocket Starter: Disconnected / ${err.message}`)
                setStatus(2)
                Delay(start, 5000)

            }
        }

        /** Trigger Start.Websocket on Close */
        ws.onclose(() => {
            // console.log(`ws:Disconnected (Retry in 5s)`)
            Delay(async () => await start(), 5000)
        })

        /** Trigger Start.Websocket */
        Delay(async () => await start(), 0)

        return async () => {
            shouldReconnect = false
            await ws.stop()
        }

    }, [])

    let content = ''

    const direct = (key, name, shift) => {

        const dt = key.split(' ') /** [2020/06/06, 04:00-16:00] **/
        const Date = moment(`${dt[0]} ${dt[1].split('-')[0]}:00`, `YYYY/MM/DD HH:mm:ss`).format('YYYY-MM-DD')
        const StartDate = moment(`${dt[0]} ${dt[1].split('-')[0]}:00`, `YYYY/MM/DD HH:mm:ss`).format(dateFormat)
        const EndDate = moment(`${dt[0]} ${dt[1].split('-')[1]}:00`, `YYYY/MM/DD HH:mm:ss`).add(shift === 'Night' ? 1 : 0, 'days').format(dateFormat)

        const payload = {
            AssetTypeName: name,
            Date: Date,
            StartDate: StartDate,
            EndDate: EndDate,
        }

        const stringified = queryString.stringify(payload)
        navigate(`/allocations?${stringified}`)
        setTimeout(() => window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" }), 500)

    }

    if (status > 0) content = <Space size={16}>

        {[0, 1, 2, 3].map((i) => (
            <Skeleton.Node active={status === 1} key={i}>
                {status === 1 || status === 3 ?
                    <RetweetOutlined style={{ fontSize: 40, color: '#bfbfbf' }} /> :
                    <ApiOutlined style={{ fontSize: 40, color: '#f56a00' }} />
                }
            </Skeleton.Node>
        ))}

    </Space>

    else content = <div>
        {
            Object.keys(items).sort().reverse().map((key) => <div key={key}>
                <Divider orientation="left">{key}</Divider>
                <Row gutter={[16, 16]}>
                    {items[key].map(({ Title, Date, Shift, Name, Count = 0 }) => (
                        <Col key={`${key}_${Name}`} xs={24} sm={12} md={8} lg={6} xl={4} xxl={3}>
                            <Card style={{ opacity: Count > 0 ? 1 : 0.5 }} variant={Count <= 0} size='small' hoverable={Count > 0} onClick={() => direct(key, Name, Shift)}>
                                <Statistic
                                    title={Name}
                                    value={' '}
                                    valueStyle={{ fontWeight: 'bold' }}
                                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                                    prefix={
                                        <>
                                            <span>{Shift === 'Night' ? <Moon size={20} color={token['blue-5']} /> : <Sun size={20} color={token['orange-5']} />}</span>
                                            <span style={{ display: 'inline-block', marginLeft: 8 }}>
                                                <AnimatedNumber
                                                    fontStyle={{ fontSize: 26 }}
                                                    animationType={"calm"}
                                                    animateToNumber={Count > 0 ? Count : 0}
                                                />
                                            </span>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>)
        }
    </div>

    return <LetMeWrap>
        <Collapse defaultActiveKey={[location.pathname]} size="small" items={[{
            key: '/',
            label: <Badge status="processing" text="PPE Monitoring dashboard" />,
            children: content,
            extra: <>
                {/* <Tag icon={<UserSwitchOutlined />} bordered={true} color="geekblue">{ttl.current.person}</Tag> */}
                <Tag style={{ opacity: ttl.current.asset > 0 ? 1 : 0 }} icon={<TagsOutlined />} bordered={true} color="geekblue">{ttl.current.asset}</Tag>
            </>
        }]} bordered={false} expandIconPosition="end" />
    </LetMeWrap>

}