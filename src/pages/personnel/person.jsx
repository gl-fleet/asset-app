import React, { useState, useEffect } from 'react'
import { Button, Tooltip, Space, Card, Avatar, Skeleton } from 'antd'
import { MailOutlined, PhoneOutlined, FormOutlined } from '@ant-design/icons'
import { useParams } from "react-router-dom"

import NonReturnableList from '../../common/components/nonreturnable'
import Qualification from '../../common/components/qualification'
import IssueReturn from '../../common/components/allocation'

import { ErrorResponse } from '../../common/utils'
import { useBridge } from '../../hooks/bridge'

export default (_) => {

    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'Personnels' })
    const [activeTab, setActiveTab] = useState('01')
    const { id } = useParams()

    useEffect(() => { get(id) }, [id])

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

    if (data.PersonnelNo) return (
        <Card
            title={<>
                <Avatar size="small" style={{ fontWeight: 'bold', backgroundColor: '#f56a00', verticalAlign: 'bottom' }}>{(data.FirstName ?? '#')[0]}</Avatar>
                <span style={{ paddingLeft: 8 }}>{`${data.FirstName ?? '***'} ${data.LastName ?? ''}`} ({data.PersonnelNo})</span>
            </>}
            activeTabKey={activeTab}
            onTabChange={(key) => setActiveTab(key)}
            extra={
                <Space wrap>

                    <Tooltip title="Mail">
                        <Button href={`mailto: ${data.Email}`} shape="circle" icon={<MailOutlined />} />
                    </Tooltip>

                    <Tooltip title="Phone">
                        <Button href={`tel:${data.ContactNumber} `} shape="circle" icon={<PhoneOutlined />} />
                    </Tooltip>

                    <Tooltip title="Edit">
                        <Button shape="circle" icon={<FormOutlined />} onClick={() => _.geve.emit('gperson', { id: `${data.PersonnelId}_${data.PersonnelNo}` })} />
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
                    label: `Special items`,
                },
                {
                    key: '03',
                    label: `Trainings`,
                },
            ]}
            style={{ padding: 0, margin: 0 }}
        >

            {activeTab === '01' ? <IssueReturn filter={{ FilterField: "PersonnelNo", FilterValue: id }} /> : null}
            {activeTab === '02' ? <NonReturnableList span={6} card={false} viewOnly={true} PersonnelId={data.PersonnelId} PersonnelNo={data.PersonnelNo} size='small' /> : null}
            {activeTab === '03' ? <Qualification span={6} PersonnelNo={Number(id)} /> : null}

        </Card>
    )

}