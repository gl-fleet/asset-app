import React, { useEffect, useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, Form, Input } from 'antd'
import styled from 'styled-components'

import { useBridge } from '../hooks/bridge'
import { Now, KeyValue, ErrorResponse, Sfy, parseJwt } from '../common/utils'

const Wrapper = styled.section`
    display: table;
    height: 100%;
`

const Center = styled.section`
    display: table-cell;
    vertical-align: middle;
    .dark {
        filter: brightness(0) invert(1);
        color: #fff;
    }
    .light {
        color: #e37222;
    }
`

const Logo = styled.section`

    display: block;
    position: relative;
    padding: 4px 4px 0px 4px;
    width: 140px;
    margin: auto;
    margin-bottom: 24px;

    img {
        width: 100px;
    }

    > span: nth-child(2) {
        position: absolute;
        font-weight: 800;
        font-size: 22px;
        bottom: 16px;
        left: 83px;
    }

    > span: nth-child(3) {
        position: absolute;
        font-size: 14px;
        font-weight: 800;
        bottom: 4px;
        left: 72px;
    }

`

export default ({ isDarkMode, setSoftPass }) => {

    const [{ set: { loading, data, error } }, { set }] = useBridge({ url: 'Login', message: false, checkAuth: false })
    const [iError, setError] = useState(null)

    useEffect(() => {

        if (typeof data === 'object' && data.hasOwnProperty('AccessToken') && data.hasOwnProperty('Personnel')) {

            try {

                let { AccessToken } = data
                let parsed = parseJwt(AccessToken)
                let { PersonnelNo, Email, role, departments: Departments, FirstName, LastName } = parsed

                if (role && Departments) {

                    let Roles = Array.isArray(role) ? role : typeof role === 'string' ? [role] : role
                    let Deps = (Departments ?? '').split(',')
                    for (let i = 0; i < Roles.length; i++) Roles[i] = `${Deps[i]}-${Roles[i]}`

                    KeyValue('department', Deps[0])
                    KeyValue('token', AccessToken)
                    KeyValue('User', `${FirstName} ${LastName}`)
                    KeyValue('PersonnelNo', PersonnelNo)
                    KeyValue('Email', Email)
                    KeyValue('Roles', Sfy(Roles))
                    setSoftPass(`login-${Now()}`)

                } else {
                    setError(<Alert type="warning" message={`No role found for ${Email}`} banner closable style={{ marginBottom: 16 }} />)
                }

            } catch (err) {

                console.log(err.message)
                setError(<Alert type="error" message={err.message} banner closable style={{ marginBottom: 16 }} />)

            }

        }

    }, [loading, data])

    return <Wrapper>
        <Center>
            <Form
                name="normal_login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={set}
                style={{ width: 320, margin: 'auto' }}
            >
                <Logo className={isDarkMode ? 'dark' : 'light'}>
                    <img src={'/logo.png'} />
                    <span>Asset</span>
                    <span>Allocation</span>
                </Logo>
                <Form.Item
                    name="Username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="Password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>

                {iError}
                <ErrorResponse error={error} extra={<br />} />

                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox disabled>Remember me</Checkbox>
                    </Form.Item>
                    {/*<a className="login-form-forgot inctive-link" href="">Forgot password</a>*/}
                </Form.Item>

                <Form.Item>
                    <Button loading={loading} type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>Log in</Button>
                    {/*Or <a href="" className='inctive-link'>register now!</a> */}
                </Form.Item>

            </Form>
        </Center>
    </Wrapper>

}