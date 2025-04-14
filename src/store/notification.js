import { createSlice } from '@reduxjs/toolkit'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { notification } from 'antd'

export const initial = {
    key: '',
    icon: '',
    message: '',
    placement: 'bottomLeft',
}

export const notifySlice = createSlice({

    name: 'notify',

    initialState: initial,

    reducers: {

        open: (state, { payload }) => ({ ...state, ...payload })

    }

})

const { reducer, actions } = notifySlice
export const { open } = actions
export default reducer

/** Example => dispatch(openNotify({ message: 'Please wait' })) **/
export const openNotify = (args) => (dispatch) => {
    setTimeout(() => {
        dispatch(open(args))
    }, 250)
}

export const ReduxNotify = () => {

    const { key, icon, message, placement } = useSelector((state) => state.notify)
    const [notifyAPI, notifyHolder] = notification.useNotification()

    useEffect(() => {

        typeof message === 'string' && message.length > 0 && notifyAPI.open({ key, icon, message, placement })

    })

    return notifyHolder

}