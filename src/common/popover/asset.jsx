import { Link } from "react-router-dom"
import React, { useEffect, useState } from 'react'
import { Avatar, Card, Descriptions, Popover, Skeleton, Spin, Tag, Badge } from 'antd'
import { BarcodeOutlined, EllipsisOutlined, ExportOutlined, SettingOutlined, SwapOutlined, TagOutlined } from '@ant-design/icons'

import { ErrorResponse, f } from '../utils'
import { useBridge } from '../../hooks/bridge'

const { Meta } = Card

const getColor = (desc) => {

    if (desc === 'Visitor') return { c: 'red', t: 'v' }
    if (desc === 'Spare') return { c: 'blue', t: 's' }
    return { c: 'grey', t: 0 }

}

export default ({ id, text, tag, description }) => {

    const [content, setContent] = useState(<Spin size="small" />)
    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'Assets', get: [] })

    const handleHoverChange = (open) => open && get(Number(id))
    const desc = getColor(description)
    const styles = { top: 0, right: 8 }

    useEffect(() => {

        if (loading) return setContent(
            <Card style={{ width: 280, padding: 0, margin: 0 }}>
                <Skeleton loading={loading} active />
            </Card>
        )

        if (error.length > 0) return setContent(
            <div style={{ display: 'block', padding: 4, width: 280 - (8) }} >
                <ErrorResponse error={error} />
            </div>
        )

        if (data) return setContent(
            <Card
                style={{ width: 280, padding: 0, margin: 0 }}
                actions={false ? [
                    <EllipsisOutlined key="more" />,
                    <SettingOutlined key="maintenance" />,
                    <SwapOutlined key="allocate" />,
                    <a target='_blank' href={`/assets/${id}`}> <ExportOutlined key="jump" /> </a>,
                ] : null}
            >
                <Meta
                    avatar={<Avatar style={{ fontWeight: 'bold', backgroundColor: '#1677ff', verticalAlign: 'bottom' }} icon={<TagOutlined />} />}
                    title={`${data.Serial ?? '###'} ${desc.t === 0 ? '' : `(${description})`}`}
                    description={data.Rfid ?? ''}
                />
            </Card>
        )

    }, [loading])

    if (typeof text !== 'undefined') return <Popover id="popover-asset" content={content} onOpenChange={handleHoverChange}>
        <Link to={`/assets/${id}`}>
            <Badge dot={desc.t !== 0} color={desc.c} size="small" style={{ ...styles }} title={description}>
                {/* <Tag style={{ overflow: 'hidden', maxWidth: text.length > 24 ? 160 : 'auto' }} color={'geekblue'} bordered={false} icon={tag ? <TagOutlined /> : <BarcodeOutlined />}>{text}</Tag> */}
                <Tag style={{ whiteSpace: 'nowrap', maxWidth: text.length > 24 ? 160 : 'auto', overflow: 'clip' }} color={'geekblue'} bordered={false} icon={tag ? <TagOutlined /> : <BarcodeOutlined />}>
                    {text}
                </Tag>
            </Badge>
        </Link>
    </Popover>

    else return <Popover id="popover-asset" content={content} onOpenChange={handleHoverChange}>
        <Link to={`/assets/${id}`}>
            <Badge dot={desc.t !== 0} color={desc.c} size="small" style={{ ...styles }}>
                <Tag color={'geekblue'} style={{ cursor: 'pointer' }}>{id}</Tag>
            </Badge>
        </Link>
    </Popover>

}