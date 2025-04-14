import React, { useState, useEffect } from 'react'
import { Button, Tooltip, Space, Card, Avatar, Skeleton } from 'antd'
import { SettingOutlined, TagOutlined, SwapOutlined } from '@ant-design/icons'
import { useParams } from "react-router-dom"

import IssueReturn from '../../common/components/allocation'
import Maintenace from '../../common/components/maintenance'
import { ErrorResponse, kv } from '../../common/utils'
import { useBridge } from '../../hooks/bridge'

export default () => {

    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'Assets', get: [] })
    const [activeTab, setActiveTab] = useState('01')
    const { id } = useParams()

    useEffect(() => {

        get({
            DepartmentId: Number(kv('department', ['1'])),
            FilterField: 'Id',
            FilterValue: id,
        })

    }, [id])

    if (loading) return (
        <Card style={{ padding: 0, margin: 0 }}>
            <Skeleton loading={loading} avatar active />
        </Card>
    )

    if (error.length > 0) return (
        <Card style={{ padding: 0, margin: 0 }}>
            <ErrorResponse error={error} />
        </Card>
    )

    const obj = data?.Asset?.[0]

    if (obj) return (
        <Card
            title={<>
                <Avatar icon={<TagOutlined />} size="small" style={{ fontWeight: 'bold', backgroundColor: '#1677ff', verticalAlign: 'bottom' }}>{(obj.TypeName ?? '#')[0]}</Avatar>
                <span style={{ paddingLeft: 8 }}>{obj.TypeName ?? '***'} ({obj.Serial ?? '***'})</span>
            </>}
            activeTabKey={activeTab}
            onTabChange={(key) => setActiveTab(key)}
            extra={
                <Space wrap>

                    <Tooltip title="Maintenance">
                        <Button shape="circle" icon={<SettingOutlined />} disabled />
                    </Tooltip>

                    <Tooltip title="Issue / Return">
                        <Button shape="circle" icon={<SwapOutlined />} disabled />
                    </Tooltip>

                </Space>
            }
            tabList={[
                {
                    key: '01',
                    label: `Issue / Return`,
                },
                {
                    key: '02',
                    label: `Maintenance`,
                },
            ]}
            style={{ padding: 0, margin: 0 }}
        >

            {activeTab === '01' ? <IssueReturn filter={{ FilterField: "AssetId", FilterValue: id }} /> : null}
            {activeTab === '02' ? <Maintenace filter={{ FilterField: "AssetId", FilterValue: id }} /> : null}

        </Card>
    )

}