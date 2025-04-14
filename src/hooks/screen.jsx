import { useMemo } from 'react'
import { Grid } from 'antd'
import { currentScreen } from '../common/utils'

const { useBreakpoint } = Grid

export const useScreen = () => {

    const screens = useBreakpoint()
    const current = useMemo(() => currentScreen(screens), [screens])

    if (screens.hasOwnProperty('xs')) return current

    const size = window.innerWidth

    if (size >= 1600) return 6
    if (size >= 1200) return 5
    if (size >= 992) return 4
    if (size >= 768) return 3
    if (size >= 576) return 2
    return 1

}
