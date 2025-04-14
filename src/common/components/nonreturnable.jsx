import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Popconfirm, List, Empty, Card, Avatar, Button, Popover, Tooltip, Typography, Spin, Badge, theme } from 'antd'
import { FormOutlined } from '@ant-design/icons'
import Marquee from "react-fast-marquee"
import styled from 'styled-components'
import moment from 'moment'

import { useBridge } from '../../hooks/bridge'
import { IconMap } from '../../common/svgs'
import { KeyValue, Broadcast, Sfy, Delay } from '../utils'

const { useToken } = theme
const { Title, Text, Paragraph } = Typography

const Let = styled.div`
    .ant-list-item {
        padding: 2px 4px;
        font-size: 12px !important;
    }
`

const Item = ({ Args, Items, PermitId, AssignedUserId, viewOnly, size, span, onChange = null }) => {

    const { token } = useToken()
    const [{ set: { loading } }, { set }] = useBridge({ url: 'NonReturnableAssetAllocations', states: { set: ['Allocating', 'Allocated'] } })

    const { Allocated, AllocatedDate } = Array.isArray(Items) && Items.length > 0 ? Items[0] : { Allocated: false, AllocatedDate: '' }
    const gridStyle = {
        width: `${100 / (24 / span)}%`,
        textAlign: 'center',
        padding: '18px 0px 8px 0px',
        // cursor: Allocated ? 'initial' : 'pointer',
        cursor: 'pointer',
        background: Allocated ? token.colorFillAlter : '',
        overflow: 'hidden',
    }

    const _Items = useMemo(() => { return Items.filter(({ Key }) => typeof Key === 'string' && Key[0] === '-' ? false : true) }, [Items.length])

    const RenderItem = () => {

        const useMarque = false

        if (Allocated) return null
        else return (
            <div style={{ padding: "0px 8px" }}>
                {
                    _Items.length > 1
                        ? useMarque
                            ? <Marquee>{_Items.map(({ Key, Value }) => <Text code key={Key} style={{ fontSize: 12 }}>{Key ? `${Key}: ${Value}` : `No data`}</Text>)}</Marquee>
                            : _Items.map(({ Key, Value }) => <Text code key={Key} style={{ fontSize: 12, wordBreak: 'break-all', whiteSpace: 'nowrap' }}>{Key ? `${Key}: ${Value}` : `No data`}</Text>)
                        : _Items.map(({ Key, Value }) => <Text code title={`${Key}: ${Value}`} key={Key} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{(Key ? `${Key}: ${Value}` : `No data`).slice(0, 18)}{(`${Key}: ${Value}`).length > 18 ? '...' : ''}</Text>)
                }
            </div>
        )
    }

    const stock = Items[0].TypeLimit - Items[0].AllocatedCount
    const available = stock > 0

    return <Card.Grid style={gridStyle} onClick={() => { /* !Allocated && */ set({ PermitId: Number(PermitId), AssignedUserId }, onChange) }}>

        <Popconfirm title={`${Args[1]} limit reached!`} okText="Assign" placement='top' disabled={true /* !Allocated */} onConfirm={() => { set({ PermitId: Number(PermitId), AssignedUserId }, onChange) }} >

            <div>

                <Spin spinning={loading} size='small'>

                    <Badge count={stock} size='default' showZero color={available ? "#52c41a" : "#f56a00"}>
                        <Avatar icon={IconMap(token, Args[2], { size: 28, color: '#fff' })} size={size === 'default' ? 64 : 48} style={{ backgroundColor: available > 0 ? '#52c41a' : '#f56a00', verticalAlign: 'middle' }} />
                    </Badge>

                    <Title style={{ fontSize: 14, marginBottom: 2, marginTop: 2 }}>{Args[1]}</Title>

                    {Allocated ? <Text code style={{ fontSize: 12, display: 'block' }}>Allocated {AllocatedDate}</Text> : null}

                    <Popover placement="bottom" content={() => <Let><List
                        size="small"
                        dataSource={_Items}
                        renderItem={({ Key, Value }) => <List.Item actions={[<b style={{ fontSize: 12 }}>{Value ?? '-'}</b>]}>{Key ?? '-'}</List.Item>}
                    /></Let>}>
                        <div><RenderItem /></div>
                    </Popover>

                </Spin>

            </div>

        </Popconfirm>

    </Card.Grid >

}

export default ({ title = 'Special items', PersonnelId, PersonnelNo, card = true, viewOnly = false, size = 'small', span = 6, geve = null }) => {

    const [dataPermits, actionPermit] = useBridge({ url: 'NonReturnableAssetPersonnelPermits' })
    const [items, setItems] = useState({})
    const cast = useMemo(() => new Broadcast('logs', (value) => {

        Delay(() => value.type === 'nonreturnable' && actionPermit.get('refetch'), 50)

    }), [])

    useEffect(() => {

        actionPermit.on(({ payload }) => actionPermit.get(payload))

    }, [])

    useEffect(() => {

        typeof PersonnelId === 'number' && PersonnelId > 99 && actionPermit.get({
            "FilterField": "PersonnelId",
            "FilterValue": PersonnelId,
            "PageSize": 99,
        })

    }, [PersonnelId])

    useMemo(() => {

        if (dataPermits.get.loading === false && Array.isArray(dataPermits.get.data)) {

            const ls = dataPermits.get.data
            const map = {}

            ls
                .filter(({ TypeName }) => TypeName && TypeName[0] !== '-')
                .filter(({ Enabled }) => Enabled === 1).forEach(({
                    Id,
                    TypeName,
                    TypeIconName,
                    SettingsFieldName,
                    SettingsValue,
                    AllocationColor,
                    AllocationLastDate,
                    /** --- **/
                    TypeLimit,
                    AllocatedCount,
                    TypeCooldownDays,
                }) => {

                    const key = `${Id}:${TypeName}:${TypeIconName}`

                    if (!map[key]) map[key] = []
                    // console.log(key, AllocationColor)

                    // typeof SettingsFieldName === 'string' && SettingsFieldName[0] !== '-' && 
                    map[key].push({
                        Id: Id,
                        Name: TypeName,
                        Icon: TypeIconName,
                        Key: SettingsFieldName,
                        Value: SettingsValue,
                        Allocated: typeof AllocationColor === 'string' && AllocationColor === 'Red',
                        AllocatedDate: typeof AllocationLastDate === 'string' && moment(AllocationLastDate).isValid() ? moment(AllocationLastDate).fromNow() : '',
                        TypeLimit,
                        AllocatedCount,
                        TypeCooldownDays,
                    })

                })

            setItems(map)

            return map

        } else return {}

    }, [dataPermits.get.loading])

    // if (dataPermits.get.loading) return <Skeleton active />

    if (card) return <Spin spinning={dataPermits.get.loading}>
        <Card
            title={title}
            className='special-items'
            size={size}
            extra={
                <Tooltip title="Edit" >
                    <Button disabled={viewOnly || geve === null} size='small' type='default' shape="circle" icon={<FormOutlined />} onClick={() => geve && geve.emit('gperson', { id: `${PersonnelId}_${PersonnelNo}` })} />
                </Tooltip>
            }
        >

            {Object.keys(items).length > 0 ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />}
            {Object.keys(items).map((key) => (
                <Item
                    key={key}
                    viewOnly={viewOnly}
                    span={span}
                    onChange={(state) => {
                        if (state === 'then') {

                            setTimeout(() => actionPermit.get('refetch'), 25)
                            // KeyValue('logs', Sfy({ type: 'nonreturnable', action: 'refetch', time: `${Date.now()}` }))
                            cast.emit(Sfy({ type: 'nonreturnable', action: 'refetch', time: `${Date.now()}` }))

                        }
                    }}
                    Items={items[key]}
                    Args={key.split(':')}
                    PermitId={key.split(':')[0]}
                    AssignedUserId={PersonnelNo}
                    size={size}
                />
            ))}

        </Card>
    </Spin>
    else return <Spin spinning={dataPermits.get.loading}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>

            {Object.keys(items).length > 0 ? null : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />}
            {Object.keys(items).map((key) => (
                <Item
                    key={key}
                    viewOnly={viewOnly}
                    span={span}
                    onChange={(state) => {
                        if (state === 'then') {

                            setTimeout(() => actionPermit.get('refetch'), 25)
                            // KeyValue('logs', Sfy({ type: 'nonreturnable', action: 'refetch', time: `${Date.now()}` }))
                            cast.emit(Sfy({ type: 'nonreturnable', action: 'refetch', time: `${Date.now()}` }))

                        }
                    }}
                    Items={items[key]}
                    Args={key.split(':')}
                    PermitId={key.split(':')[0]}
                    AssignedUserId={PersonnelNo}
                    size={size}
                />
            ))}

        </div>
    </Spin>

}