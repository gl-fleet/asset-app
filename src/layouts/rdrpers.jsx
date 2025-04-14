import React, { useEffect, useMemo } from "react"
import { Typography } from 'antd'
import { LoadingOutlined, CloseCircleOutlined, IdcardOutlined } from '@ant-design/icons'
import { Link } from "react-router-dom"

import { Sfy, kv, Broadcast } from '../common/utils'
import { useBridge } from '../hooks/bridge'

const { Text } = Typography
let pre_rfid = ''
let pre_time = Date.now()

export default ({ geve, notifyAPI }) => {

    const [{ }, { get }] = useBridge({ url: 'Personnels' })
    const [{ }, { get: findAsset }] = useBridge({ url: 'Assets' })
    const cast = useMemo(() => new Broadcast('person-reader', (value) => geve.emit('person-data', value)), [])

    const fetchPerson = (CardNum = '') => {

        if (pre_rfid === CardNum && (Date.now() - pre_time) <= 1250) { return }
        pre_rfid = CardNum
        pre_time = Date.now()
        const marginTop = 11

        kv('mousemove', `${Date.now()}`)

        geve.emit('person-reader', ({ key: CardNum, loading: true, data: null }))

        const cut = (x = '...') => x.length > 30 ? x.substring(0, 30) + '...' : x

        notifyAPI.open({
            key: CardNum,
            icon: <LoadingOutlined style={{ fontSize: 14, marginTop, color: '#108ee9' }} />,
            message: <span>{cut(`Card Number: ${CardNum}`)}</span>,
            placement: 'bottomLeft',
            duration: 0
        })

        findAsset({ departmentId: kv('department', [1]), FilterField: "Rfid", FilterValue: CardNum }, (is, e) => {

            if (is === 'then' && e && e.hasOwnProperty('Asset')) {

                if (e.Asset.length === 0) {

                    get({ FilterField: "CardNum", FilterValue: CardNum }, (is, e) => {

                        if (is === 'then') {

                            const Person = e?.Personnel?.[0] ?? {}

                            const { FirstName, LastName, PersonnelNo } = Person

                            if (PersonnelNo !== undefined) {

                                geve.emit('person-reader', ({ key: CardNum, loading: false, data: Person }))

                                // KeyValue('person-reader', Sfy({ FirstName, LastName, PersonnelNo, Time: Date.now() }))
                                cast.emit(Sfy({ FirstName, LastName, PersonnelNo, Time: Date.now() }))

                                notifyAPI.open({
                                    key: CardNum,
                                    icon: <IdcardOutlined style={{ fontSize: 14, marginTop }} />,
                                    message: <Link to={`/personnel/${PersonnelNo}`}>
                                        <Text>{cut(`${FirstName} ${LastName}`)}</Text>
                                        <b style={{ marginLeft: 6 }}>{`[ ${PersonnelNo} ]`}</b>
                                    </Link>,
                                    placement: 'bottomLeft',
                                })

                            } else {

                                notifyAPI.open({
                                    key: CardNum,
                                    icon: <CloseCircleOutlined style={{ fontSize: 14, marginTop, color: 'orange' }} />,
                                    message: <span>{cut(`No data with ${CardNum}`)}</span>,
                                    placement: 'bottomLeft',
                                })

                            }

                        }

                        if (is === 'catch') {

                            notifyAPI.open({
                                key: CardNum,
                                icon: <CloseCircleOutlined style={{ fontSize: 14, marginTop, color: 'orange' }} />,
                                message: <span>{cut(e[0] ?? CardNum)}</span>,
                                placement: 'bottomLeft',
                            })

                        }

                        if (is === 'finally') {

                            geve.emit('person-reader', ({ key: CardNum, loading: false, data: null }))

                        }

                    })

                } else {
                    geve.emit('person-reader', ({ key: CardNum, loading: false, data: null }))
                    geve.emit('serial_port', `#${CardNum}`)
                }

            }

        })

    }

    useEffect(() => {

        let prev = Date.now()
        let last = ``
        let code = ``
        let gap = false

        geve.on('hid_port', (id) => { id && id[0] === '#' && fetchPerson(id.replace('#', '')) })

        const bind = (event) => {

            try {

                if (event.code.indexOf('Key') >= 0 || event.code.indexOf('Digit') >= 0 || event.code.indexOf('Enter') >= 0) {

                    let end = event.code.indexOf('Enter') >= 0

                    if (end && code.length >= 8) {

                        code = code.replace(/[^a-z0-9]/gi, '').toUpperCase()
                        let isnum = /^\d+$/.test(code)

                        if (isnum && code.length >= 10) fetchPerson(Number(code).toString(16).toUpperCase())
                        else fetchPerson(code.toUpperCase())

                        code = ''

                    }

                    if ((Date.now() - prev <= 75)) {

                        gap = false
                        if (code === '') code = last
                        code += end ? '' : event.key

                    } else { code = `` }

                    prev = Date.now()
                    last = event.key

                }

            } catch (err) { console.log(`[Person.Card.Reader]`, err) }

        }

        window.addEventListener('keyup', bind)

    }, [])

    return null

}