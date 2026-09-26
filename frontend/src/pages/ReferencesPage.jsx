import { useState } from 'react'
import { api } from '../api'
import { Confirm, EmptyState, ErrorState, Field, Loader, Modal, PageHeader } from '../components/Common'
import { useAsync } from '../hooks/useAsync'

const CONFIG = {
  persons: { title: 'Люди', singular: 'человека', path: '/references/persons' },
  events: { title: 'События', singular: 'событие', path: '/references/events' },
  venues: { title: 'Площадки', singular: 'площадку', path: '/references/venues' },
}

export function ReferencesPage({ version, onChanged }) {
  const [tab, setTab] = useState('persons')
  const [dialog, setDialog] = useState(null)
  const [details, setDetails] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const config = CONFIG[tab]
  const result = useAsync(() => api.get(config.path), [tab, version])

  const changeTab = (nextTab) => {
    setTab(nextTab)
    setDialog(null); setDetails(null); setConfirmDelete(null)
  }
  const remove = async () => {
    try {
      await api.delete(`${config.path}/${confirmDelete.id}`)
      setConfirmDelete(null)
      onChanged('Запись удалена')
    } catch (error) { setConfirmDelete({ ...confirmDelete, error: error.message }) }
  }

  return <section className="page">
    <PageHeader title="Справочники" />
    <div className="reference-toolbar"><div className="tabs">{Object.entries(CONFIG).map(([key, value]) => <button className={tab === key ? 'active' : ''} key={key} onClick={() => changeTab(key)}>{value.title}</button>)}</div><button className="button primary" onClick={() => setDialog({ mode: 'create' })}>+ Добавить {config.singular}</button></div>
    <div className="panel reference-panel">
      {result.loading ? <Loader /> : result.error ? <ErrorState message={result.error} /> : result.data.length ? <div className="reference-grid">{result.data.map((item) => <ReferenceCard key={item.id} kind={tab} item={item} onOpen={() => setDetails(item)} onEdit={() => setDialog({ mode: 'edit', item })} onDelete={() => setConfirmDelete(item)} />)}</div> : <EmptyState title={`${config.title} не добавлены`} text="Создайте первую запись для привязки к билетам." />}
    </div>
    {details && <ReferenceDetails kind={tab} item={details} onClose={() => setDetails(null)} onEdit={() => { setDialog({ mode: 'edit', item: details }); setDetails(null) }} />}
    {dialog && <ReferenceDialog kind={tab} {...dialog} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); onChanged(dialog.mode === 'create' ? 'Запись создана' : 'Запись изменена') }} />}
    {confirmDelete && <Confirm title="Удалить запись?" text="Связанные с этой записью билеты также будут удалены." error={confirmDelete.error} onCancel={() => setConfirmDelete(null)} onConfirm={remove} />}
  </section>
}

function ReferenceCard({ kind, item, onOpen, onEdit, onDelete }) {
  let title, rows
  if (kind === 'persons') { title = item.passportId || `Человек #${item.id}`; rows = [`${item.weight} кг`, item.location?.name || 'Место не указано', `${item.hairColor} волосы`, item.nationality || 'Национальность не указана'] }
  if (kind === 'events') { title = item.name; rows = [`Минимальный возраст: ${item.minAge}`, item.description] }
  if (kind === 'venues') { title = item.name; rows = [`${item.capacity} мест`, item.address?.zipCode, item.address?.street || 'Улица не указана'] }
  const stop = (callback) => (event) => { event.stopPropagation(); callback() }
  return <article className="reference-card" role="button" tabIndex="0" onClick={onOpen} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onOpen()}>
    <span className="card-id">#{item.id}</span><h3>{title}</h3><div className="reference-summary">{rows.map((row, index) => <p key={index}>{row}</p>)}</div>
    <div className="reference-actions"><button onClick={stop(onEdit)}>Изменить</button><button className="text-danger" onClick={stop(onDelete)}>Удалить</button></div>
  </article>
}

function ReferenceDetails({ kind, item, onClose, onEdit }) {
  let title, rows
  if (kind === 'persons') {
    title = `Человек #${item.id}`
    rows = [['Passport ID', item.passportId || 'Не указан'], ['Вес', `${item.weight} кг`], ['Цвет глаз', item.eyeColor || 'Не указан'], ['Цвет волос', item.hairColor], ['Национальность', item.nationality || 'Не указана'], ['Местоположение', item.location.name], ['Координата X места', item.location.x], ['Координата Y места', item.location.y]]
  }
  if (kind === 'events') {
    title = `Событие #${item.id}`
    rows = [['Название', item.name], ['Минимальный возраст', item.minAge], ['Описание', item.description]]
  }
  if (kind === 'venues') {
    title = `Площадка #${item.id}`
    rows = [['Название', item.name], ['Вместимость', `${item.capacity} мест`], ['Улица', item.address?.street || 'Не указана'], ['Почтовый индекс', item.address?.zipCode]]
  }
  return <Modal title={title} subtitle="Все атрибуты вспомогательного объекта" onClose={onClose}>
    <dl className="details">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="modal-actions"><button className="button ghost" onClick={onClose}>Закрыть</button><button className="button primary" onClick={onEdit}>Изменить</button></div>
  </Modal>
}

function ReferenceDialog({ kind, mode, item, onClose, onSaved }) {
  const metadata = useAsync(() => api.get('/metadata'), [])
  const [form, setForm] = useState(initial(kind, item))
  const [error, setError] = useState('')
  const config = CONFIG[kind]
  const set = (key, value) => setForm({ ...form, [key]: value })

  const submit = async (event) => {
    event.preventDefault(); setError('')
    const validation = validate(kind, form)
    if (validation) { setError(validation); return }
    let payload
    if (kind === 'persons') payload = { eyeColor: form.eyeColor || null, hairColor: form.hairColor, location: { x: Number(form.locationX), y: Number(form.locationY), name: form.locationName.trim() }, weight: Number(form.weight), passportId: form.passportId.trim() || null, nationality: form.nationality || null }
    if (kind === 'events') payload = { name: form.name.trim(), minAge: Number(form.minAge), description: form.description.trim() }
    if (kind === 'venues') payload = { name: form.name.trim(), capacity: Number(form.capacity), address: { street: form.street.trim() || null, zipCode: form.zipCode.trim() } }
    try {
      if (mode === 'create') await api.post(config.path, payload)
      else await api.put(`${config.path}/${item.id}`, payload)
      onSaved()
    } catch (failure) { setError(failure.message) }
  }

  return <Modal title={`${mode === 'create' ? 'Добавить' : 'Изменить'} ${config.singular}`} onClose={onClose}>
    {metadata.loading ? <Loader /> : metadata.error ? <ErrorState message={metadata.error} /> : <form onSubmit={submit} className="form-grid single">
      {kind === 'persons' && <>
        <Field label="Passport ID" hint="не более 26 символов"><input maxLength="26" value={form.passportId} onChange={(event) => set('passportId', event.target.value)} /></Field>
        <Field label="Вес *"><input type="number" min="1" step="1" value={form.weight} onChange={(event) => set('weight', event.target.value)} /></Field>
        <Field label="Цвет глаз"><EnumSelect value={form.eyeColor} values={metadata.data.colors} optional onChange={(value) => set('eyeColor', value)} /></Field>
        <Field label="Цвет волос *"><EnumSelect value={form.hairColor} values={metadata.data.colors} onChange={(value) => set('hairColor', value)} /></Field>
        <Field label="Национальность"><EnumSelect value={form.nationality} values={metadata.data.countries} optional onChange={(value) => set('nationality', value)} /></Field>
        <Field label="Место *"><input value={form.locationName} onChange={(event) => set('locationName', event.target.value)} /></Field>
        <Field label="X места *"><input type="number" step="any" value={form.locationX} onChange={(event) => set('locationX', event.target.value)} /></Field>
        <Field label="Y места *"><input type="number" step="any" value={form.locationY} onChange={(event) => set('locationY', event.target.value)} /></Field>
      </>}
      {kind === 'events' && <><Field label="Название *"><input value={form.name} onChange={(event) => set('name', event.target.value)} /></Field><Field label="Минимальный возраст *"><input type="number" step="1" value={form.minAge} onChange={(event) => set('minAge', event.target.value)} /></Field><Field label="Описание *"><textarea value={form.description} onChange={(event) => set('description', event.target.value)} /></Field></>}
      {kind === 'venues' && <><Field label="Название *"><input value={form.name} onChange={(event) => set('name', event.target.value)} /></Field><Field label="Вместимость *"><input type="number" min="1" step="1" value={form.capacity} onChange={(event) => set('capacity', event.target.value)} /></Field><Field label="Улица"><input value={form.street} onChange={(event) => set('street', event.target.value)} /></Field><Field label="Почтовый индекс *" hint="не менее 7 символов"><input minLength="7" value={form.zipCode} onChange={(event) => set('zipCode', event.target.value)} /></Field></>}
      {error && <div className="form-error full">{error}</div>}
      <div className="modal-actions full"><button type="button" className="button ghost" onClick={onClose}>Отмена</button><button className="button primary">Сохранить</button></div>
    </form>}
  </Modal>
}

function initial(kind, item) {
  if (kind === 'persons') return { passportId: item?.passportId || '', weight: item?.weight || '', eyeColor: item?.eyeColor || '', hairColor: item?.hairColor || 'GREEN', nationality: item?.nationality || '', locationName: item?.location?.name || '', locationX: item?.location?.x ?? '', locationY: item?.location?.y ?? '' }
  if (kind === 'events') return { name: item?.name || '', minAge: item?.minAge ?? '', description: item?.description || '' }
  return { name: item?.name || '', capacity: item?.capacity || '', street: item?.address?.street || '', zipCode: item?.address?.zipCode || '' }
}

function validate(kind, form) {
  if (kind === 'persons' && ((!Number.isInteger(Number(form.weight)) || !(Number(form.weight) > 0)) || !form.locationName.trim() || form.locationX === '' || form.locationY === '')) return 'Заполните обязательные поля; вес должен быть целым и больше 0.'
  if (kind === 'events' && (!form.name.trim() || !form.description.trim() || form.minAge === '' || !Number.isInteger(Number(form.minAge)))) return 'Укажите название, целый минимальный возраст и описание события.'
  if (kind === 'venues' && (!form.name.trim() || !Number.isInteger(Number(form.capacity)) || !(Number(form.capacity) > 0) || form.zipCode.trim().length < 7)) return 'Укажите название, целую положительную вместимость и индекс длиной не менее 7 символов.'
  return ''
}

function EnumSelect({ value, values, optional, onChange }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)}>{optional && <option value="">Не указано</option>}{values.map((entry) => <option key={entry}>{entry}</option>)}</select>
}
