import { useState } from 'react'
import { api } from '../../api'
import { useAsync } from '../../hooks/useAsync'
import { ErrorState, Field, Loader, Modal } from '../Common'
import { REFERENCE_CONFIG } from './referenceConfig'
export function ReferenceDialog({ kind, mode, item, onClose, onSaved }) {
  const metadata = useAsync(() => api.get('/metadata'), [])
  const [form, setForm] = useState(initial(kind, item))
  const [error, setError] = useState('')
  const config = REFERENCE_CONFIG[kind]
  const set = (key, value) => setForm({ ...form, [key]: value })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const validation = validate(kind, form)
    if (validation) {
      setError(validation)
      return
    }
    let payload
    if (kind === 'persons')
      payload = {
        eyeColor: form.eyeColor || null,
        hairColor: form.hairColor,
        location: {
          x: Number(form.locationX),
          y: Number(form.locationY),
          name: form.locationName.trim(),
        },
        weight: Number(form.weight),
        passportId: form.passportId.trim() || null,
        nationality: form.nationality || null,
      }
    if (kind === 'events')
      payload = {
        name: form.name.trim(),
        minAge: Number(form.minAge),
        description: form.description.trim(),
      }
    if (kind === 'venues')
      payload = {
        name: form.name.trim(),
        capacity: Number(form.capacity),
        address: { street: form.street.trim() || null, zipCode: form.zipCode.trim() },
      }
    try {
      if (mode === 'create') await api.post(config.path, payload)
      else await api.put(`${config.path}/${item.id}`, payload)
      onSaved()
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <Modal
      title={`${mode === 'create' ? 'Добавить' : 'Изменить'} ${config.singular}`}
      onClose={onClose}
    >
      {metadata.loading ? (
        <Loader />
      ) : metadata.error ? (
        <ErrorState message={metadata.error} />
      ) : (
        <form onSubmit={submit} className="form-grid single">
          {kind === 'persons' && (
            <>
              <Field label="Passport ID" hint="не более 26 символов">
                <input
                  maxLength="26"
                  value={form.passportId}
                  onChange={(event) => set('passportId', event.target.value)}
                />
              </Field>
              <Field label="Вес *">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.weight}
                  onChange={(event) => set('weight', event.target.value)}
                />
              </Field>
              <Field label="Цвет глаз">
                <EnumSelect
                  value={form.eyeColor}
                  values={metadata.data.colors}
                  optional
                  onChange={(value) => set('eyeColor', value)}
                />
              </Field>
              <Field label="Цвет волос *">
                <EnumSelect
                  value={form.hairColor}
                  values={metadata.data.colors}
                  onChange={(value) => set('hairColor', value)}
                />
              </Field>
              <Field label="Национальность">
                <EnumSelect
                  value={form.nationality}
                  values={metadata.data.countries}
                  optional
                  onChange={(value) => set('nationality', value)}
                />
              </Field>
              <Field label="Место *">
                <input
                  value={form.locationName}
                  onChange={(event) => set('locationName', event.target.value)}
                />
              </Field>
              <Field label="X места *">
                <input
                  type="number"
                  step="any"
                  value={form.locationX}
                  onChange={(event) => set('locationX', event.target.value)}
                />
              </Field>
              <Field label="Y места *">
                <input
                  type="number"
                  step="any"
                  value={form.locationY}
                  onChange={(event) => set('locationY', event.target.value)}
                />
              </Field>
            </>
          )}
          {kind === 'events' && (
            <>
              <Field label="Название *">
                <input value={form.name} onChange={(event) => set('name', event.target.value)} />
              </Field>
              <Field label="Минимальный возраст *">
                <input
                  type="number"
                  step="1"
                  value={form.minAge}
                  onChange={(event) => set('minAge', event.target.value)}
                />
              </Field>
              <Field label="Описание *">
                <textarea
                  value={form.description}
                  onChange={(event) => set('description', event.target.value)}
                />
              </Field>
            </>
          )}
          {kind === 'venues' && (
            <>
              <Field label="Название *">
                <input value={form.name} onChange={(event) => set('name', event.target.value)} />
              </Field>
              <Field label="Вместимость *">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={(event) => set('capacity', event.target.value)}
                />
              </Field>
              <Field label="Улица">
                <input
                  value={form.street}
                  onChange={(event) => set('street', event.target.value)}
                />
              </Field>
              <Field label="Почтовый индекс *" hint="не менее 7 символов">
                <input
                  minLength="7"
                  value={form.zipCode}
                  onChange={(event) => set('zipCode', event.target.value)}
                />
              </Field>
            </>
          )}
          {error && <div className="form-error full">{error}</div>}
          <div className="modal-actions full">
            <button type="button" className="button ghost" onClick={onClose}>
              Отмена
            </button>
            <button className="button primary">Сохранить</button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function initial(kind, item) {
  if (kind === 'persons')
    return {
      passportId: item?.passportId || '',
      weight: item?.weight || '',
      eyeColor: item?.eyeColor || '',
      hairColor: item?.hairColor || 'GREEN',
      nationality: item?.nationality || '',
      locationName: item?.location?.name || '',
      locationX: item?.location?.x ?? '',
      locationY: item?.location?.y ?? '',
    }
  if (kind === 'events')
    return {
      name: item?.name || '',
      minAge: item?.minAge ?? '',
      description: item?.description || '',
    }
  return {
    name: item?.name || '',
    capacity: item?.capacity || '',
    street: item?.address?.street || '',
    zipCode: item?.address?.zipCode || '',
  }
}

function validate(kind, form) {
  if (
    kind === 'persons' &&
    (!Number.isInteger(Number(form.weight)) ||
      !(Number(form.weight) > 0) ||
      !form.locationName.trim() ||
      form.locationX === '' ||
      form.locationY === '')
  )
    return 'Заполните обязательные поля; вес должен быть целым и больше 0.'
  if (
    kind === 'events' &&
    (!form.name.trim() ||
      !form.description.trim() ||
      form.minAge === '' ||
      !Number.isInteger(Number(form.minAge)))
  )
    return 'Укажите название, целый минимальный возраст и описание события.'
  if (
    kind === 'venues' &&
    (!form.name.trim() ||
      !Number.isInteger(Number(form.capacity)) ||
      !(Number(form.capacity) > 0) ||
      form.zipCode.trim().length < 7)
  )
    return 'Укажите название, целую положительную вместимость и индекс длиной не менее 7 символов.'
  return ''
}

function EnumSelect({ value, values, optional, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {optional && <option value="">Не указано</option>}
      {values.map((entry) => (
        <option key={entry}>{entry}</option>
      ))}
    </select>
  )
}
