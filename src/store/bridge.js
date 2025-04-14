import { createSlice } from '@reduxjs/toolkit'

export const initial = {
    key: Date.now(),
    from: '',
    to: '',
    payload: null,
}

export const messageSlice = createSlice({

    name: 'bridge',
    initialState: initial,
    reducers: {
        set: (state, { payload }) => ({ ...state, ...payload })
    }

})

const { reducer, actions } = messageSlice
export const { set } = actions
export default reducer

export const emitBridge = (args) => (dispatch) => dispatch(set(args))