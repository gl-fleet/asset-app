import React, { useEffect, useMemo, useState } from 'react'
import { Menu, Select, Badge } from 'antd'
import { Link } from "react-router-dom"
import styled from 'styled-components'

import { useBridge } from '../hooks/bridge'
import { KeyValue, kv, myDeps, department_access_list } from '../common/utils'

const Logo = styled.section`

    display: table;
    position: relative;
    > a {
        display: table-cell;
    }
    img {
        width: 32px;
        vertical-align: middle;
        margin-top: -2px;
    }
    span {
        vertical-align: middle;
        padding-left: 8px;
        font-weight: 600;
    }
    .light > span {
        color: #000000e0 !important;
    }
    .dark > span {
        color: rgba(255, 255, 255, 0.85);
    }

`

export default ({ reload, isDarkMode }) => {

    const [{ get: { loading, data, error } }, { get }] = useBridge({ url: 'Departments', get: [] })
    const deps = useMemo(() => myDeps(), [])
    const department_obj = useMemo(() => department_access_list(), [])
    const [department, setDepartment] = useState(Number(kv('department', [`${deps[0]}`])))

    useEffect(() => { get({}) }, [])


    useEffect(() => {

        if (loading === false && Array.isArray(data) && data.length > 0) {

            try {

                const obj = {}
                data.forEach(({ Id, Name }) => { obj[Id] = Name })
                KeyValue('departments', JSON.stringify(obj))

            } catch (err) { console.log(err) }

        }

    }, [loading])

    useEffect(() => {

        if (KeyValue('department')) {

            if (KeyValue('department') !== String(department)) {

                KeyValue('department', department)
                reload()

            }

        } else KeyValue('department', department)

    }, [department])

    return <>
        <Menu
            id="logo_menu"
            mode="horizontal"
            selectable={false}
            inlineIndent={0}
            style={{ justifyContent: 'start', fontWeight: 600 }}
            items={[
                {
                    key: "logo",
                    label: <Logo>
                        <Link to={`/`} className={isDarkMode ? 'dark' : 'light'}>
                            <img src={'/logo.png'} />
                            <span>Asset</span>
                            <span>Allocation</span>
                        </Link>
                    </Logo>
                },
                {
                    key: "s_1",
                    label: <Select
                        style={{ minWidth: 140 }}
                        loading={loading}
                        disabled={loading}
                        status={error.length > 0 ? 'error' : ''}
                        value={error.length > 0 ? error[0] ?? 'Error' : loading ? 'Departments' : Number(department)}
                        onChange={(value) => setDepartment(value)}
                        options={data.map(({ Id, Name }) => {

                            const disabled = !deps.includes(Number(Id))
                            return {
                                value: Id,
                                label: Name,
                                title: `Level-${department_obj[`${Id}`] ?? '0'}`,
                                disabled,
                            }

                        })}
                    />
                }
            ]}
        />
    </>

}