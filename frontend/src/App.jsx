import { useEffect, useState } from 'react'
import { updatesUrl } from './api'
import { ReferencesPage } from './pages/ReferencesPage'
import { SpecialPage } from './pages/SpecialPage'
import { TicketsPage } from './pages/TicketsPage'
import { VisualizationPage } from './pages/VisualizationPage'

const NAV = [
  ['tickets', 'Билеты'], ['visual', 'Визуализация'],
  ['references', 'Справочники'], ['special', 'Спецоперации'],
]

export default function App() {
  const [page, setPage] = useState('tickets')
  const [syncVersion, setSyncVersion] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let socket, retry
    let stopped = false
    const connect = () => {
      socket = new WebSocket(updatesUrl())
      socket.onmessage = () => {
        setSyncVersion((value) => value + 1)
        setNotice('Данные обновлены другим клиентом')
      }
      socket.onerror = () => socket.close()
      socket.onclose = () => {
        if (!stopped) {
          retry = window.setTimeout(connect, 2500)
        }
      }
    }
    connect()
    return () => { stopped = true; window.clearTimeout(retry); socket?.close() }
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const changed = (message) => {
    setSyncVersion((value) => value + 1)
    setNotice(message)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">T</span><span>Ticket System</span></div>
      <nav>{NAV.map(([id, label]) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => setPage(id)}>{label}</button>)}</nav>
    </aside>
    <main>
      {page === 'tickets' && <TicketsPage version={syncVersion} onChanged={changed} />}
      {page === 'visual' && <VisualizationPage version={syncVersion} onChanged={changed} />}
      {page === 'references' && <ReferencesPage version={syncVersion} onChanged={changed} />}
      {page === 'special' && <SpecialPage version={syncVersion} onChanged={changed} />}
    </main>
    {notice && <div className="toast">{notice}</div>}
  </div>
}
