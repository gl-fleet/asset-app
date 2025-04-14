import React, { useState, useEffect, useRef, useMemo } from 'react'
import { SwapOutlined } from '@ant-design/icons'
import { Drawer, Modal, Button, Steps, Tooltip } from 'antd'
import { useLocation } from "react-router-dom"
import Draggable from 'react-draggable'

import FindPerson from './person'
import AssignAsset from './assign'

import { Broadcast, KeyValue, Sfy, Loop, kv, Delay } from '../../../common/utils'

const Timer = ({ setCurrent, setTitle, geve }) => {

    const [cnt, setCnt] = useState(0)
    const cast = useMemo(() => new Broadcast('logs'), [])

    /** For clearing the screen after 30 seconds **/
    /** More UI testing required to use Scree-Blanking feature */
    useEffect(() => {

        Loop(() => {

            if (typeof setCurrent === 'function') {

                const time = 31 - Math.ceil((Date.now() - Number(kv('mousemove', ['0']))) / 1000)
                let cur = 0, t = 0

                setCurrent((n) => {
                    cur = n
                    t = n > 0 && time <= 0 ? 0 : n
                    return t
                })

                if (cur === 0) setCnt(0)
                else time > 0 && setCnt(time)

            }

        }, 1000)

    }, [])

    useEffect(() => {

        cnt === 1 && typeof setTitle === 'function' && Delay(() => {

            setTitle(<span>Assign</span>)
            geve.emit('clear-person', 'clear')
            // KeyValue('logs', Sfy({ key: Date.now(), type: 'clearScreen', action: 'clear', t: 0 }))
            cast.emit(Sfy({ key: Date.now(), type: 'clearScreen', action: 'clear', t: 0 }))

        }, 750)

    }, [cnt])

    return cnt > 0 ? `(${cnt})` : null

}

export default ({ geve, event, pRef, messageAPI }) => {

    const design = KeyValue('iAssign') ?? 'Drawer'
    const [open, setOpen] = useState(false)
    const [size, setSize] = useState(800)
    const [current, setCurrent] = useState(0)
    const [title, setTitle] = useState(<span>Assign</span>)
    const [plusTitle, setPlusTitle] = useState(null)

    const [disabled, setDisabled] = useState(true)
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
    const draggleRef = useRef(null)

    const loc = useLocation()

    useEffect(() => {

        if (loc.hash.indexOf('#open') === 0) {

            if ((Date.now() - Number(loc.hash.split('_')[1])) < 250) {
                setOpen(true)
                setCurrent(0)
            }

        } else if (loc.hash.indexOf('#close') === 0) {

            if ((Date.now() - Number(loc.hash.split('_')[1])) < 250) {

                setOpen(false)
                geve.emit('AssetAllocations', 'refetch')

            }

        }

    }, [loc.hash])

    useEffect(() => {

        const assignNext = () => setCurrent((prev) => prev === 2 ? prev : prev + 1)
        const assignPrev = () => setCurrent((prev) => prev === 0 ? prev : prev - 1)
        const assignStep = (n) => setCurrent((prev) => n)
        const guideVerified = (n) => { /* setPlusTitle(<b>{n}</b>) */ }

        event.on('assign-next', assignNext)
        event.on('assign-prev', assignPrev)
        event.on('assign-step', assignStep)
        geve.on('on-guide-verified', guideVerified)

        return () => {

            event.off('assign-next', assignNext)
            event.off('assign-prev', assignPrev)
            event.off('assign-step', assignStep)
            geve.off('on-guide-verified', guideVerified)

        }

    }, [])

    useEffect(() => {

        current === 0 && setSize(640)
        current === 1 && setSize(800)

    }, [current])

    useEffect(() => { kv('IsIssueOpen', `${open}`) }, [open])

    const onStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement
        const targetRect = draggleRef.current?.getBoundingClientRect()
        const extra = 250
        if (!targetRect) return
        setBounds({
            left: -targetRect.left + uiData.x - extra,
            right: clientWidth - (targetRect.right - uiData.x) + extra,
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y) + extra,
        })
    }

    const props = { setCurrent, setTitle, event, geve, isOpen: open, isModal: design === 'Modal', messageAPI }

    if (design === 'Drawer') return <>

        <Tooltip title="Assign">
            <Button ref={pRef} type="primary" shape="circle" icon={<SwapOutlined />} onClick={() => {
                setOpen(true)
                setCurrent(0)
            }} />
        </Tooltip>

        <Drawer
            title={current === 1 ? title : 'Person'}
            closeIcon={null}
            forceRender={false}
            destroyOnClose={true}
            placement="right"
            open={open}
            width={size}
            onClose={() => {

                setOpen(false)
                geve.emit('AssetAllocations', 'refetch')

            }}
            extra={[
                <Steps
                    key="step"
                    type="inline"
                    style={{ verticalAlign: 'middle' }}
                    current={current}
                    onChange={(c) => setCurrent(c)}
                    items={[
                        {
                            title: 'Person',
                            description: 'Find a person',
                        },
                        {
                            title: <span>Assign <Timer {...props} /></span>,
                            description: 'Asset allocation',
                        },
                    ]}
                />,
            ]}
        >

            <div style={{ display: current === 0 ? 'initial' : 'none' }}>
                <FindPerson {...props} />
            </div>

            <div style={{ display: current === 1 ? 'initial' : 'none' }}>
                <AssignAsset {...props} />
            </div>

        </Drawer>

    </>

    if (design === 'Modal') return <>

        <Tooltip title="Assign">
            <Button ref={pRef} type="primary" shape="circle" icon={<SwapOutlined />} onClick={() => {
                setOpen(true)
                setCurrent(0)
            }} />
        </Tooltip>

        <Modal
            id="assign_title"
            title={
                <div
                    style={{ width: '100%', cursor: 'move' }}
                    onMouseOver={() => { if (disabled) setDisabled(false) }}
                    onMouseOut={() => setDisabled(true)}
                    onFocus={() => { }}
                    onBlur={() => { }}
                >
                    {current === 1 ? <>{title}{plusTitle}</> : 'Person'}
                </div>
            }
            width={size}
            open={open}
            forceRender={false}
            destroyOnClose={true}
            onCancel={() => {
                setOpen(false)
                geve.emit('AssetAllocations', 'refetch')
            }}
            footer={[
                <Steps
                    key="step"
                    type="inline"
                    style={{ verticalAlign: 'middle' }}
                    current={current}
                    onChange={(c) => setCurrent(c)}
                    items={[
                        {
                            title: 'Person',
                            description: 'Find a person',
                        },
                        {
                            title: <span>Assign <b><Timer {...props} /></b></span>,
                            description: 'Asset allocation',
                        },
                    ]}
                />
            ]}
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    onStart={(event, uiData) => onStart(event, uiData)}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
        >

            <div style={{ display: current === 0 ? 'initial' : 'none' }}>
                <FindPerson {...props} />
            </div>

            <div style={{ display: current === 1 ? 'initial' : 'none' }}>
                <AssignAsset {...props} />
            </div>

        </Modal>

    </>

}