import { useState } from 'react'
import { api } from '../api'
import { Confirm, EmptyState, ErrorState, Loader, PageHeader } from '../components/Common'
import { ReferenceCard } from '../components/references/ReferenceCard'
import { REFERENCE_CONFIG } from '../components/references/referenceConfig'
import { ReferenceDetails } from '../components/references/ReferenceDetails'
import { ReferenceDialog } from '../components/references/ReferenceDialog'
import { useAsync } from '../hooks/useAsync'
export function ReferencesPage({ version, onChanged }) {
  const [tab, setTab] = useState('persons')
  const [dialog, setDialog] = useState(null)
  const [details, setDetails] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const config = REFERENCE_CONFIG[tab]
  const result = useAsync(() => api.get(config.path), [tab, version])

  const changeTab = (nextTab) => {
    setTab(nextTab)
    setDialog(null)
    setDetails(null)
    setConfirmDelete(null)
  }
  const remove = async () => {
    try {
      await api.delete(`${config.path}/${confirmDelete.id}`)
      setConfirmDelete(null)
      onChanged('Запись удалена')
    } catch (error) {
      setConfirmDelete({ ...confirmDelete, error: error.message })
    }
  }

  return (
    <section className="page">
      <PageHeader title="Справочники" />
      <div className="reference-toolbar">
        <div className="tabs">
          {Object.entries(REFERENCE_CONFIG).map(([key, value]) => (
            <button
              className={tab === key ? 'active' : ''}
              key={key}
              onClick={() => changeTab(key)}
            >
              {value.title}
            </button>
          ))}
        </div>
        <button className="button primary" onClick={() => setDialog({ mode: 'create' })}>
          + Добавить {config.singular}
        </button>
      </div>
      <div className="panel reference-panel">
        {result.loading ? (
          <Loader />
        ) : result.error ? (
          <ErrorState message={result.error} />
        ) : result.data.length ? (
          <div className="reference-grid">
            {result.data.map((item) => (
              <ReferenceCard
                key={item.id}
                kind={tab}
                item={item}
                onOpen={() => setDetails(item)}
                onEdit={() => setDialog({ mode: 'edit', item })}
                onDelete={() => setConfirmDelete(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`${config.title} не добавлены`}
            text="Создайте первую запись для привязки к билетам."
          />
        )}
      </div>
      {details && (
        <ReferenceDetails
          kind={tab}
          item={details}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setDialog({ mode: 'edit', item: details })
            setDetails(null)
          }}
        />
      )}
      {dialog && (
        <ReferenceDialog
          kind={tab}
          {...dialog}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            onChanged(dialog.mode === 'create' ? 'Запись создана' : 'Запись изменена')
          }}
        />
      )}
      {confirmDelete && (
        <Confirm
          title="Удалить запись?"
          text="Связанные с этой записью билеты также будут удалены."
          error={confirmDelete.error}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </section>
  )
}
