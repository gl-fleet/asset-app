import React from 'react'
import { Divider, Checkbox, theme } from 'antd'
import { IconMap } from '../../svgs'

const { useToken } = theme

export const PermitCheck = () => {

    const { token } = useToken()

    return <Divider orientation="left" dashed>
        <Checkbox
            checked={hide[e.Id]}
            onChange={(c) => {
                setHide((curr) => {
                    const obj = {}
                    obj[e.Id] = c.target.checked
                    return { ...curr, ...obj }
                })
            }}
        >{e.Name}</Checkbox>
        {IconMap(token, e.IconName)}
    </Divider>

}