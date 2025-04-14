import { createSlice } from '@reduxjs/toolkit'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { message } from 'antd'

export const initial = {
    key: '',
    type: '',
    content: '',
    duration: 1,
}

export const messageSlice = createSlice({

    name: 'message',

    initialState: initial,

    reducers: {

        open: (state, { payload }) => ({ ...state, ...payload })

    }

})

const { reducer, actions } = messageSlice
export const { open } = actions
export default reducer

/** Example => dispatch(openMessage({ type: 'loading', content: 'Please wait' })) **/
export const openMessage = (args) => (dispatch) => {
    setTimeout(() => {
        dispatch(open(args))
    }, 250)
}

export const ReduxMessage = () => {

    const { key, type, content, duration } = useSelector((state) => state.message)
    const [messageAPI, messageHolder] = message.useMessage()

    useEffect(() => {

        typeof content === 'string' && content.length > 0 && messageAPI.open({ key, type, content, duration })

    })

    return messageHolder

}