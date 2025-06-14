import styled from 'styled-components'
import React, { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Avatar, Breadcrumb, Col, Layout, Menu, Row, Button, Tooltip, theme } from 'antd'
import { LineChartOutlined, FolderOpenOutlined, FolderOutlined, HomeOutlined, LoadingOutlined, LogoutOutlined, SettingOutlined, SwapOutlined, TagOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'
import moment from 'moment'

import { KeyValue, Now, kv, env, persist, AsyncWait, Delay, Loop } from '../common/utils'
import { useBridge } from '../hooks/bridge'
import { useScreen } from '../hooks/screen'
import DepartmentMenu from './department'

const { Header, Content, Footer, Sider } = Layout

const LetMeWrap = styled.section`
    .ant-menu-overflow {
        border-bottom: none;
    }
    #logo_menu li:nth-child(1) {
        margin-top: -2px;
        margin-left: -16px;
    }
    .ant-menu-sub {
        max-height: 600px;
        overflow: auto;
    } 
    .ant-menu-submenu li {
        height: 24px; 
        padding-left: 38px !important;
        font-size: 12px;
    }
`

export default ({ reload, isDarkMode, setSoftPass, children }) => {

    const [{ get: { loading, data } }, { get, on }] = useBridge({ url: 'DepartmentAssetTypes', get: [] })
    const { token: { colorBgContainer } } = theme.useToken()
    const loc = useLocation()
    const user = kv('Email', ['Unknown'])
    const departmentId = kv('department', [1])
    const size = useScreen()
    const navigate = useNavigate()

    const [que, full, len] = useMemo(() => {

        console.log(`----- ----- ----- [${loc.pathname}] ----- ----- -----`);

        const gen = loc.pathname + (loc.hash[0] === '#' ? '/' + loc.hash.replace('#', '').replaceAll('_', ' ') : '')
        const lss = gen.replace('/', '').split('/')

        const path_map = {
            /** General **/
            '/assets': '/assets',
            '/personnel': '/personnel',
            '/allocations': '/allocations',
            '/maintenance': '/maintenance',
            /** Details **/
            '/assets/type/[0]/[1]': '/assets/[1]',
            '/assets/[0]': '/assets/[0]',
            '/personnel/[0]': '/personnel/[0]',
        }

        let s = ''
        let m = 0
        let r = []
        let l = []

        for (const x in path_map) {

            let i = 0
            let s = ''
            let c = ''
            let o = {}

            for (const t of lss) {

                if (x.indexOf(s + `/${t}`) === 0) {
                    s = s + `/${t}`
                    c = c + `/${t}`
                } else if (x.indexOf(s + `/[${i}]`) === 0) {
                    s = s + `/[${i}]`
                    c = c + `/${t}`
                    o[`[${i++}]`] = t
                }

            }

            if (x === s && x.length > m) {
                r = [s, c, path_map[x], o]
                m = x.length
            }

        }

        r[2] && r[2].replace('/', '').split('/').forEach((t, i) => {
            s = s + '/' + (r[3][t] ?? t)
            l.push(r[3][t] ?? t)
        })

        return [l, r[1] ? r[1].split('/') : [], l.length]

    }, [loc.pathname])

    useEffect(() => { get({ departmentId }) }, [departmentId])
    useEffect(() => { on(({ payload }) => get(payload)) }, [])

    useEffect(() => {

        if (loading === false && data.length > 0) {

            const store = {}
            data.forEach(e => { store[e.AssetTypeId] = e })
            persist.set('department_asset_type', store)

        }

    }, [loading])

    useEffect(() => {

        window.location.hostname === 'localhost' && Delay(() => {

            /** Caplamp allocation: Normal Spare Visitor (Shaft-2/Database:5) **/
            false && setTimeout(async () => {
                navigate(`/allocations#open_${Date.now()}`)
                await AsyncWait(1200)
                ReadPerson("04236F54")
                await AsyncWait(1200)
                ReadAsset("E2801170000002179372232E")
                await AsyncWait(1200)
                ReadAsset("E2806890000040111CF73D46")
                await AsyncWait(1200)
                ReadAsset("E2806890000040111CF73DB9")
                await AsyncWait(1200)
                ReadAsset("E2801170000002136CF6D502")
            }, 2000)

        })

    }, [])

    const userItems = [
        {
            key: "s_0",
            icon: <Avatar size='small' style={{ color: '#fff', backgroundColor: '#f56a00', verticalAlign: 'middle', marginTop: -4, textTransform: 'uppercase' }}>{user[0]}</Avatar>,
            label: user,
            children: [
                {
                    key: "s_0_1",
                    icon: <SettingOutlined />,
                    disabled: true,
                    label: <span onClick={() => { console.log('profile') }}>Profile</span>,
                },
                {
                    key: "s_0_2",
                    icon: <LogoutOutlined />,
                    onClick: () => { KeyValue('token', '') && setSoftPass(`logout-${Now()}`) },
                    label: "Logout",
                }
            ]
        }
    ]

    const navItems = [
        {
            key: "report",
            icon: <LineChartOutlined />,
            label: <Link target='_blank' to={env['REPORT_URL']}>Reports</Link>,
        },
        {
            key: "personnel",
            icon: <TeamOutlined />,
            label: <Link to={`/personnel`}>Personnel</Link>,
        },
        {
            key: "assets",
            icon: loading ? <LoadingOutlined /> : <TagOutlined />,
            label: <Link style={{ display: 'block' }} to={`/assets`}>Assets</Link>,
            children: (data ?? []).filter(({ AssetTypeName }) => AssetTypeName[0] !== '-').map(({ Id, AssetTypeId, AssetTypeName }) => ({
                key: AssetTypeId,
                icon: full.includes(`${AssetTypeId}`) ? <FolderOpenOutlined /> : <FolderOutlined />,
                label: <Link title={AssetTypeName} to={`/assets/type/${AssetTypeId}#${String(AssetTypeName).replaceAll(' ', '_')}`}>{AssetTypeName}</Link>,
            }))
        },
        {
            key: "allocations",
            icon: <SwapOutlined />,
            label: <Link to={`/allocations`}>Issue / Return</Link>,
        },
        {
            key: "maintenance",
            icon: <ToolOutlined />,
            label: <Link to={`/maintenance`}>Maintenance</Link>,
        },
    ]

    return (
        <LetMeWrap>
            <Layout>

                <Header style={{ alignItems: 'center', background: colorBgContainer, padding: `0 ${size > 4 ? 50 : 8}px` }}>
                    <Row>
                        <Col span={12}>
                            <DepartmentMenu reload={reload} isDarkMode={isDarkMode} />
                        </Col>
                        <Col span={12}>
                            <Menu style={{ justifyContent: 'end', fontWeight: 600 }} items={userItems} mode="horizontal" />
                        </Col>
                    </Row>
                </Header>

                <Content style={{ padding: `0 ${size > 4 ? 50 : 8}px` }}>

                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: <HomeOutlined />, href: '/' },
                        { title: 'Asset Allocation', href: '/' },
                        ...que.map((e, i) => ({
                            title: <span style={{ textTransform: 'capitalize' }}>{e}</span>,
                            href: i === len - 1 ? undefined : `/${e}`
                        }))
                    ]} />

                    <Layout style={{ padding: '24px 0', background: colorBgContainer, borderRadius: 8 }}>

                        <Sider style={{ background: colorBgContainer }} width={200} collapsed={size < 4}>
                            <Menu
                                defaultOpenKeys={[size < 4 ? "" : "assets"]}
                                openKeys={size >= 4 ? ['assets'] : []}
                                selectedKeys={full}
                                style={{ height: '100%', fontWeight: 500 }}
                                items={navItems}
                                mode="inline"
                            />
                        </Sider>

                        <Content style={{ padding: '0 24px', minHeight: 280 }}>
                            {children}
                        </Content>

                    </Layout>

                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    <Button href="mailto:otugtechsoftwareengineers@ot.mn" type='link' style={{ color: '#666' }}>
                        <Tooltip styles={{ root: { maxWidth: 512 } }} title={<span style={{ whiteSpace: 'nowrap' }}>{"Contact: otugtechsoftwareengineers@ot.mn"}</span>} >© {moment().format('YYYY')} - OT Information Technology Team</Tooltip>
                    </Button>
                </Footer>

            </Layout>
        </LetMeWrap>
    )
}