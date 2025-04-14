import React from 'react'
import { Button, Result } from 'antd'
import { Link } from "react-router-dom"
import styled from 'styled-components'

const Wrapper = styled.section`
    display: table;
    height: 100%;
    width: 100%;
`

const Center = styled.section`
    display: table-cell;
    vertical-align: middle;
`

export default ({

    status = '404',
    title = '404',
    subTitle = "Sorry, the page you visited does not exist."

}) => {

    return <Wrapper>
        <Center>
            <Result
                status={status}
                title={title}
                subTitle={subTitle}
                extra={
                    <Link to="/">
                        <Button type="primary">Back Home</Button>
                    </Link>
                }
            />
        </Center>
    </Wrapper>

}