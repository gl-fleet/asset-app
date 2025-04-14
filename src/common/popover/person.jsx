import { Link } from "react-router-dom"
import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, Card, Popover, Skeleton, Spin, Tag } from 'antd'
import { ExportOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, AndroidOutlined } from '@ant-design/icons'

import { ErrorResponse } from '../utils'
import { useBridge } from '../../hooks/bridge'

const { Meta } = Card

export default ({ id, text }) => {

    const [content, setContent] = useState(<Spin size="small" />)
    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'Personnels', get: {} })


    const isok = useMemo(() => { return !(text?.props?.title?.indexOf('-') === 0) }, [id])

    useEffect(() => {

        if (loading) return setContent(
            <Card style={{ width: 280, padding: 0, margin: 0 }}>
                <Skeleton loading={loading} avatar active />
            </Card>
        )

        if (error.length > 0) return setContent(
            <div style={{ display: 'block', padding: 4, width: 280 - (8) }} >
                <ErrorResponse error={error} />
            </div>
        )

        const name = `${data.FirstName ?? '***'} ${data.LastName ?? ''}`

        if (data) return setContent(
            <Card
                style={{ width: 280, padding: 0, margin: 0 }}
                actions={[
                    <a href={`mailto:${data.Email}`}> <MailOutlined key="mail" /> </a>,
                    <a href={`tel:${data.ContactNumber}`}><PhoneOutlined key="phone" /></a>,
                    // <SwapOutlined key="ellipsis" />,
                    <a target='_blank' href={`/personnel/${id}`}> <ExportOutlined key="jump" /> </a>,
                ]}
            >
                <Meta
                    avatar={<Avatar style={{ fontWeight: 'bold', backgroundColor: '#f56a00', verticalAlign: 'middle' }}>{(data.FirstName ?? '#')[0]}</Avatar>}
                    title={name}
                    description={(data.PositionDesc ?? '') + ` (${data.PersonnelNo ?? '***'})`}
                />
            </Card>
        )

    }, [loading])

    const handleHoverChange = (open) => open && get(id)

    if (typeof text !== 'undefined') {

        if (id === null || !isok) return text

        return <Popover id="popover-person" content={content} onOpenChange={handleHoverChange}>
            <Link to={`/personnel/${id}`}>
                <span className='link' style={{ cursor: 'pointer' }}>{text}</span>
            </Link>
        </Popover>

    }

    else if (id === 0) return <Tag color={'geekblue'} bordered={false} icon={<AndroidOutlined />}>Auto</Tag>
    else return <Popover id="popover-person" content={content} onOpenChange={handleHoverChange}>
        <Link to={`/personnel/${id}`}>
            <Tag color={'geekblue'} bordered={false} icon={<IdcardOutlined />}>{id}</Tag>
        </Link>
    </Popover>

}