import { useEffect } from 'react'

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="subtitle">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function Modal({ title, subtitle, onClose, children, wide }) {
  useEffect(() => {
    const close = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function Confirm({ title, text, error, onCancel, onConfirm }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-text">{text}</p>
      {error && <div className="form-error">{error}</div>}
      <div className="modal-actions">
        <button className="button ghost" onClick={onCancel}>
          Отмена
        </button>
        <button className="button danger" onClick={onConfirm}>
          Удалить
        </button>
      </div>
    </Modal>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
      {error && <em>{error}</em>}
    </label>
  )
}

export function Loader() {
  return (
    <div className="loader">
      <span />
      <p>Загрузка данных…</p>
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="error-state">
      <strong>Не удалось загрузить данные</strong>
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <span>◇</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export function TypeBadge({ type }) {
  return <span className={`type-badge type-${type.toLowerCase()}`}>{type}</span>
}
