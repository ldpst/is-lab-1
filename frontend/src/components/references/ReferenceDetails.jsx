import { Modal } from '../Common'

export function ReferenceDetails({ kind, item, onClose, onEdit }) {
  let title, rows
  if (kind === 'persons') {
    title = `Человек #${item.id}`
    rows = [
      ['Passport ID', item.passportId || 'Не указан'],
      ['Вес', `${item.weight} кг`],
      ['Цвет глаз', item.eyeColor || 'Не указан'],
      ['Цвет волос', item.hairColor],
      ['Национальность', item.nationality || 'Не указана'],
      ['Местоположение', item.location.name],
      ['Координата X места', item.location.x],
      ['Координата Y места', item.location.y],
    ]
  }
  if (kind === 'events') {
    title = `Событие #${item.id}`
    rows = [
      ['Название', item.name],
      ['Минимальный возраст', item.minAge],
      ['Описание', item.description],
    ]
  }
  if (kind === 'venues') {
    title = `Площадка #${item.id}`
    rows = [
      ['Название', item.name],
      ['Вместимость', `${item.capacity} мест`],
      ['Улица', item.address?.street || 'Не указана'],
      ['Почтовый индекс', item.address?.zipCode],
    ]
  }
  return (
    <Modal title={title} subtitle="Все атрибуты вспомогательного объекта" onClose={onClose}>
      <dl className="details">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
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
