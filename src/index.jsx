console.log('%c| 🌞☕💻💻💻🍲💻💻💻🍺⛺🌛 |', 'background: #000; color: #bada55')

import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import React, { useRef, useState, useEffect, useMemo } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { theme, ConfigProvider, Layout, FloatButton, notification, message } from 'antd'
import { BulbOutlined, BulbFilled, SendOutlined, SettingOutlined, FolderAddOutlined, NodeExpandOutlined, SafetyOutlined } from '@ant-design/icons'
import { EventEmitter } from "events"

import 'animate.css'
import './i18'

import store from './store'
import reportWebVitals from './reportWebVitals'
import { ReduxNotify } from './store/notification'
import { ReduxMessage } from './store/message'
import { Broadcast, InitialScale, CursorDetection, LastFocusDetection, Simulation, KeyValue, Delay, access_level, myAccess, kv, env, urls, isTokenValid } from './common/utils'

import Basic from './layouts/basic'
import PersonReader from './layouts/rdrpers'
import AssetReader from './layouts/rdrasse'

import GlobalConfig from './common/global/gconfig'
import GlobalType from './common/global/gtype'
import GlobalPerson from './common/global/gperson'
import GlobalReader from './common/global/greader'

import Login from './pages/login'
import Main from './pages/boards'
import Error from './pages/error'

import Personnel from './pages/personnel'
import Person from './pages/personnel/person'

import Assets from './pages/assets'
import Asset from './pages/assets/asset'

import Allocate from './pages/allocate'
import AllocatePage from './pages/allocate/miner'
import Maintenance from './pages/maintenance'

const currentVersion = `v${env['VERSION']}`
const workingVersion = kv('version', [''])
console.groupCollapsed(`%c${env['NAME'].toUpperCase()} ( ${currentVersion} )`, 'background: #000; color: #bada55')
for (const x in env) console.log(`[ENV.${x}]: ${env[x]}`)
for (const x in urls) console.log(`[URL.${x}]: ${urls[x]}`)
console.groupEnd()

const App = () => {

  const [isDarkMode, setIsDarkMode] = useState(KeyValue('mode') === 'dark')
  const [isSoftPass, setSoftPass] = useState('*')
  const [isReady, setReady] = useState(true)
  const [notifyAPI, notifyHolder] = notification.useNotification()
  const [messageAPI, messageHolder] = message.useMessage()
  const isDebug = useMemo(() => kv('iLog', ['Info']) === 'Debug', [])
  const isLoginPage = !KeyValue('token') || isSoftPass.indexOf('logout') >= 0 ? true : isSoftPass.indexOf('login') >= 0 ? false : location.pathname === '/login'
  const goCenter = isLoginPage || location.pathname.indexOf('boards') >= 0

  const { defaultAlgorithm, darkAlgorithm } = theme
  const event = useRef(new EventEmitter())
  const props = useRef({
    notifyAPI,
    messageAPI,
    isActive: true,
    geve: event.current,
    isSoftPass: isSoftPass,
    setSoftPass: setSoftPass,
    isDarkMode: isDarkMode,
    isLogged: true,
    inspect: (location.search ?? "").indexOf('inspect') !== -1,
    isboard: location.pathname.indexOf('/boards') === 0,
    reload: () => { setReady(false); Delay(() => setReady(true), 25) },
  })

  useEffect(() => {

    window.id = Date.now()

    if (props.current.isboard) return

    console.log(`%cAuthorized [Level:${access_level()}] for [Department:${kv('department', ['-'])}]`, 'background: #000; color: #bada55')
    // Bind the hash update in the router
    addEventListener("hashchange", ({ newURL }) => { event.current.emit('hash', newURL) })
    // The function will invoke when the user changes the tab
    window.onblur = () => { event.current.emit('focus', false) }
    // If users come back to the current tab again, the below function will invoke
    window.onfocus = () => { event.current.emit('focus', true) }
    // On page load
    window.onload = () => { event.current.emit('focus', document.hasFocus()) }
    // window.addEventListener("storage", (event) => event.key === 'department' && window.location.reload())
    CursorDetection()

    LastFocusDetection(event.current)

    isTokenValid()

    setTimeout(() => {

      if (KeyValue('token') && workingVersion !== currentVersion) {

        notifyAPI.open({ message: <div style={{ marginLeft: -16 }}><SafetyOutlined /> {workingVersion ? `Updated ${workingVersion} -> ${currentVersion}` : `Current version: ${currentVersion}`}</div>, placement: "bottom" })
        KeyValue('version', currentVersion)

      }

    }, 2500)

    /* const socket = io(urls[isSecure ? 'app_wss' : 'app_ws'], { transports: ['websocket'], path: `/app/socket.io/` })
    socket.on("connect", () => { isDebug && console.log(`[io.app.server]:Connected: ${socket.id}`) })
    socket.on("disconnect", () => { isDebug && console.log(`[io.app.server]:Disconnected: ${socket.id}`) }) */

  }, [])

  useEffect(() => { KeyValue('mode', isDarkMode ? 'dark' : 'light') }, [isDarkMode])

  const route = {

    AuthRouter: <Routes>
      <Route path="/login" element={<Login {...props.current} />} />
      <Route path="*" element={<Navigate to="/login" replace={true} />} />
    </Routes>,

    BasicRouter: <>

      <Routes>
        <Route path="/boards/allocation" element={<AllocatePage {...props.current} />} />
        <Route path="*" element={<Basic {...props.current}>{isReady ? (
          <Routes>
            <Route path="/" element={<Main {...props.current} />} />
            <Route path="/personnel" element={<Personnel {...props.current} />} />
            <Route path="/personnel/:id" element={<Person {...props.current} />} />
            <Route path="/assets" element={<Assets {...props.current} />} />
            <Route path="/assets/:id" element={<Asset {...props.current} />} />
            <Route path="/assets/type/:id" element={<Assets {...props.current} />} />
            <Route path="/allocations" element={<Allocate {...props.current} />} />
            <Route path="/maintenance" element={<Maintenance {...props.current} />} />
            <Route path="/login" element={<Navigate to="/" replace={true} />} />
            <Route path="*" element={<Error {...props.current} />} />
          </Routes>
        ) : null}
        </Basic>} />
      </Routes>

    </>,

  }

  return <ConfigProvider theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}>

    <Layout style={{ height: '100%', width: '100%' }}>
      <div style={{ height: goCenter ? '100%' : 'auto', width: '100%', background: isDarkMode ? '#000' : '#f5f5f5' }}>
        <Layout id="main" style={{ margin: 'auto', height: '100%', width: '100%', padding: 0 }}>
          <BrowserRouter>

            {notifyHolder}
            {messageHolder}

            {route[KeyValue('token') ? 'BasicRouter' : 'AuthRouter'] ?? <Error />}

            {/** Global components **/}
            {props.current.isboard === false ? <GlobalConfig {...props.current} /> : null}
            {props.current.isboard === false ? <GlobalType {...props.current} /> : null}
            {props.current.isboard === false ? <GlobalPerson {...props.current} /> : null}
            {props.current.isboard === false ? <GlobalReader {...props.current} /> : null}

            <FloatButton.Group shape="circle" style={{ display: isLoginPage ? 'none' : 'inline-table', left: 24, zIndex: 99 }}>
              <FloatButton style={{ marginBottom: 8 }} onClick={() => props.current.geve.emit('gtype', { open: true })} icon={<FolderAddOutlined />} />
              <FloatButton onClick={() => props.current.geve.emit('gconfig', { open: true })} icon={<SettingOutlined />} />
            </FloatButton.Group>

            {/** Simulation process **/}
            <Simulation {...props.current} />

          </BrowserRouter>
        </Layout>
      </div>
    </Layout>

    <FloatButton.Group shape="circle" style={{ display: isLoginPage ? 'none' : 'inline-table', right: 24, zIndex: 99 }}>
      <FloatButton style={{ display: 'none' }} onClick={() => setSoftPass('tour')} icon={<SendOutlined />} />
      <FloatButton style={{ marginBottom: 8 }} onClick={() => props.current.geve.emit('greader', { open: true })} icon={<NodeExpandOutlined />} />
      {props.current.isboard === false ? <PersonReader {...props.current} /> : null}
      {props.current.isboard === false ? <AssetReader {...props.current} /> : null}
      <FloatButton onClick={() => setIsDarkMode((prev) => { props.current.isDarkMode = !prev; return !prev; })} icon={isDarkMode ? <BulbOutlined /> : <BulbFilled />} />
    </FloatButton.Group>

  </ConfigProvider>

}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ReduxNotify />
    <ReduxMessage />
    <App />
  </Provider>
)

InitialScale()
reportWebVitals()