export function ReferenceCard({ kind, item, onOpen, onEdit, onDelete }) {
  let title, rows
  if (kind === 'persons') {
    title = item.passportId || `Человек #${item.id}`
    rows = [
      `${item.weight} кг`,
      item.location?.name || 'Место не указано',
      `${item.hairColor} волосы`,
      item.nationality || 'Национальность не указана',
    ]
  }
  if (kind === 'events') {
    title = item.name
    rows = [`Минимальный возраст: ${item.minAge}`, item.description]
  }
  if (kind === 'venues') {
    title = item.name
    rows = [
      `${item.capacity} мест`,
      item.address?.zipCode,
      item.address?.street || 'Улица не указана',
    ]
  }
  const stop = (callback) => (event) => {
    event.stopPropagation()
    callback()
  }
  return (
    <article
      className="reference-card"
      role="button"
      tabIndex="0"
      onClick={onOpen}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onOpen()}
    >
      <span className="card-id">#{item.id}</span>
      <h3>{title}</h3>
      <div className="reference-summary">
        {rows.map((row, index) => (
          <p key={index}>{row}</p>
        ))}
      </div>
      <div className="reference-actions">
        <button onClick={stop(onEdit)}>Изменить</button>
        <button className="text-danger" onClick={stop(onDelete)}>
          Удалить
        </button>
      </div>
    </article>
  )
}
