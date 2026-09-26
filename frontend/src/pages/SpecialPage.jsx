import { useState } from 'react'
import { api } from '../api'
import { ErrorState, Loader, PageHeader } from '../components/Common'
import { useAsync } from '../hooks/useAsync'

export function SpecialPage({ version, onChanged }) {
  const refs = useAsync(() => Promise.all([api.get('/references/venues'), api.get('/references/events'), api.get('/references/persons')]), [version])
  const [state, setState] = useState({ venueId: '', capacity: '', eventId: '', personId: '' })
  const [results, setResults] = useState({})
  const [busy, setBusy] = useState('')
  const run = async (action) => {
    setBusy(action); setResults((old) => ({ ...old, [action]: null }))
    try {
      let data
      if (action === 'deleteVenue') data = await api.delete(`/special/venues/${state.venueId}/tickets`)
      if (action === 'countCapacity') data = await api.get(`/special/venues/capacity-greater/${state.capacity}/count`)
      if (action === 'venues') data = await api.get('/special/unique-venues')
      if (action === 'cancel') data = await api.delete(`/special/events/${state.eventId}/tickets`)
      if (action === 'deletePerson') data = await api.delete(`/special/persons/${state.personId}/tickets`)
      setResults((old) => ({ ...old, [action]: { data } }))
      if (['deleteVenue', 'cancel', 'deletePerson'].includes(action)) onChanged('Специальная операция выполнена')
    } catch (error) { setResults((old) => ({ ...old, [action]: { error: error.message } })) }
    finally { setBusy('') }
  }
  return <section className="page">
    <PageHeader title="Специальные операции" />
    {refs.loading ? <Loader /> : refs.error ? <ErrorState message={refs.error} /> : <div className="operation-grid">
      <Operation number="01" title="Удалить билеты площадки" text="Удаляет все билеты выбранной площадки; площадка сохраняется." result={<OperationResult action="delete" result={results.deleteVenue} />}>
        <select value={state.venueId} onChange={(e) => setState({ ...state, venueId: e.target.value })}><option value="">Выберите площадку</option>{refs.data[0].map((v) => <option value={v.id} key={v.id}>{v.name} · {v.capacity} мест</option>)}</select>
        <button className="button danger" disabled={!state.venueId || busy} onClick={() => run('deleteVenue')}>Удалить билеты</button>
      </Operation>
      <Operation number="02" title="Вместимость больше заданной" text="Считает билеты, площадка которых имеет вместимость больше введённой." result={<OperationResult action="count" result={results.countCapacity} />}>
        <input type="number" step="1" placeholder="Вместимость" value={state.capacity} onChange={(e) => setState({ ...state, capacity: e.target.value })} />
        <button className="button light" disabled={state.capacity === '' || busy} onClick={() => run('countCapacity')}>Посчитать</button>
      </Operation>
      <Operation number="03" title="Уникальные площадки" text="Показывает уникальные площадки, которые используются билетами." result={<OperationResult action="venues" result={results.venues} />}>
        <button className="button light" disabled={busy} onClick={() => run('venues')}>Показать площадки</button>
      </Operation>
      <Operation number="04" title="Отменить событие" text="Удаляет все билеты события; событие, люди и площадки сохраняются." result={<OperationResult action="cancel" result={results.cancel} />}>
        <select value={state.eventId} onChange={(e) => setState({ ...state, eventId: e.target.value })}><option value="">Выберите событие</option>{refs.data[1].map((v) => <option value={v.id} key={v.id}>{v.name}</option>)}</select>
        <button className="button danger" disabled={!state.eventId || busy} onClick={() => run('cancel')}>Отменить событие</button>
      </Operation>
      <Operation number="05" title="Удалить билеты человека" text="Удаляет все билеты человека с указанным ID; сам человек сохраняется." result={<OperationResult action="deletePerson" result={results.deletePerson} />}>
        <select value={state.personId} onChange={(e) => setState({ ...state, personId: e.target.value })}><option value="">Выберите ID человека</option>{refs.data[2].map((v) => <option value={v.id} key={v.id}>#{v.id} · {v.passportId || v.location.name}</option>)}</select>
        <button className="button danger" disabled={!state.personId || busy} onClick={() => run('deletePerson')}>Удалить билеты</button>
      </Operation>
    </div>}
  </section>
}

function Operation({ number, title, text, children, result }) {
  return <article className="operation panel"><span className="operation-number">{number}</span><h2>{title}</h2><p>{text}</p><div className="operation-controls">{children}</div>{result}</article>
}
function OperationResult({ action, result }) {
  if (!result) return null
  if (result.error) return <div className="operation-result error">{result.error}</div>
  const data = result.data
  if (action === 'delete' || action === 'deletePerson') return <div className="operation-result">{data.deletedCount ? `Удалено билетов: ${data.deletedCount}.` : 'Билеты не найдены — записи не затронуты.'}</div>
  if (action === 'cancel') return <div className="operation-result">{data.deletedCount ? `Событие отменено. Удалено билетов: ${data.deletedCount}.` : 'Билеты события не найдены — записи не затронуты.'}</div>
  if (action === 'count') return <div className="operation-result">Найдено билетов: <b>{data.count}</b>.</div>
  if (action === 'venues') return <div className="operation-result scrollable">{data.length ? data.map((v) => <span key={v.id}>{v.name} · {v.capacity} мест <b>#{v.id}</b></span>) : 'Среди билетов нет площадок.'}</div>
  return null
}
