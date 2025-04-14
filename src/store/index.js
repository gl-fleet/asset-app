import { configureStore } from '@reduxjs/toolkit'

import bridge from './bridge'
import notify from './notification'
import message from './message'

export default configureStore({
    reducer: {
        bridge,
        notify,
        message,
    },
})