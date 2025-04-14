import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Select, Button, Divider } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import Lottie from "lottie-react"

import cardSwipe from '../../../common/lottie/card_swipe_1.json'
import { ErrorResponse, Delay, Tick } from '../../../common/utils'
import { useBridge } from '../../../hooks/bridge'

const tick = new Tick()

export default ({ geve, event }) => {

    const [{ get: { loading, data, error }, get: getRef }, { get }] = useBridge({ url: 'Personnels' })

    const [PersonnelNo, setPersonnelNo] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {

        tick.on((ms, value) => {

            const isNumber = typeof value === 'string' && value.length > 0 && value[0] >= '0' && value[0] <= '9'

            tick.ms === 0 && getRef.loading && tick.set(400)

            tick.ms === 0 && get({
                FilterField: isNumber ? "PersonnelNo" : "FullName",
                FilterValue: value,
                PageSize: 10,
                Page: 1,
            })

        })

        const CardReaderPerson = (e) => {

            tick.set(-1, 0)
            setDisabled(e.loading)
            if (e.loading === false && e.data !== null) {

                const { PersonnelId, PersonnelNo, FirstName, LastName } = e.data
                setPersonnelNo(PersonnelNo)
                event.emit('assign-person', { value: `${PersonnelId}_${PersonnelNo}`, label: `${FirstName} ${LastName} (${PersonnelNo})`, PersonnelId, PersonnelNo, data: e.data })
                event.emit('assign-step', 1)

            }

        }

        Delay(() => { searchRef.current.focus({ cursor: 'start' }) }, 250)
        geve.on('person-reader', CardReaderPerson)
        return () => { geve.off('person-reader', CardReaderPerson) }

    }, [])

    const onChange = (value) => tick.set(300, value)

    const onSelect = (_, { value, label, data }) => {

        setPersonnelNo(value.split('_')[1])
        event.emit('assign-person', { value, label, data })
        event.emit('assign-step', 1)
    }

    const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

    return <>

        <Lottie style={{ width: '100%' }} animationData={cardSwipe} loop={true} />

        <Divider />

        <Row gutter={8}>

            <Col span={16}>

                <Select
                    loading={loading}
                    disabled={disabled}
                    menuItemSelectedIcon={<SwapOutlined />}
                    ref={searchRef}
                    style={{ width: '100%' }}
                    showSearch
                    placeholder={PersonnelNo <= 100 ? "Select a Person" : PersonnelNo}
                    optionFilterProp="children"
                    onSearch={onChange}
                    onChange={onSelect}
                    onFocus={() => (data.Personnel ?? []).length === 0 && onChange('')}
                    filterOption={filterOption}
                    options={(data.Personnel ?? []).map((e) => {

                        const { PersonnelId, PersonnelNo, FirstName, LastName } = e
                        return {
                            value: `${PersonnelId}_${PersonnelNo}`,
                            label: `${FirstName} ${LastName} (${PersonnelNo})`,
                            data: e,
                        }

                    })}
                />

            </Col>

            <Col span={8}>

                <Button
                    style={{ width: '100%' }}
                    disabled={PersonnelNo <= 100}
                    onClick={() => event.emit('assign-next')}
                >Next</Button>

            </Col>

        </Row>

        <br />
        <ErrorResponse error={error} />

    </>

}