import { Modal } from '../Common'
import { formatDate, formatMoney } from '../../utils'

export function Sortable({ label, field, query, onSort }) {
  return (
    <th>
      <button className="sort-button" onClick={() => onSort(field)}>
        {label}
        <span>{query.sort === field ? (query.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

export function Pagination({ page, totalPages, total, size, onPage, onSize }) {
  return (
    <div className="pagination">
      <span>Всего: {total}</span>
      <label>
        На странице{' '}
        <select value={size} onChange={(event) => onSize(Number(event.target.value))}>
          <option>10</option>
          <option>20</option>
          <option>50</option>
        </select>
      </label>
      <div>
        <button disabled={page <= 0} onClick={() => onPage(page - 1)}>
          ←
        </button>
        <span>
          {totalPages ? page + 1 : 0} / {totalPages}
        </span>
        <button disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
          →
        </button>
      </div>
    </div>
  )
}

export function TicketDetails({ ticket, onClose, onEdit }) {
  const rows = [
    ['ID', `#${ticket.id}`],
    ['Название', ticket.name],
    ['Дата создания', formatDate(ticket.creationDate)],
    ['Координата X', ticket.coordinates.x],
    ['Координата Y', ticket.coordinates.y],
    ['Цена', formatMoney(ticket.price)],
    ['Тип', ticket.type],
    ['Скидка', ticket.discount ? `${ticket.discount}%` : 'Нет'],
    ['Номер', ticket.number ?? 'Не указан'],
    [
      'Владелец',
      `${ticket.person.passportId || 'без Passport ID'}, ${ticket.person.weight} кг, ${ticket.person.location.name}`,
    ],
    [
      'Событие',
      `${ticket.event.name} · от ${ticket.event.minAge} лет · ${ticket.event.description}`,
    ],
    [
      'Площадка',
      `${ticket.venue.name} · ${ticket.venue.capacity} мест · ${ticket.venue.address?.street || 'улица не указана'}, ${ticket.venue.address?.zipCode}`,
    ],
  ]
  return (
    <Modal title={ticket.name} subtitle="Карточка билета и все связанные объекты" onClose={onClose}>
      <dl className="details">
        {rows.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="modal-actions">
        <button className="button ghost" onClick={onClose}>
          Закрыть
        </button>
        <button className="button primary" onClick={onEdit}>
          Изменить
        </button>
      </div>
    </Modal>
  )
}
