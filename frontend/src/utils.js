export function formatDate(value) {
  if (value === null || value === undefined || value === '') return '—'
  const normalized = typeof value === 'string' ? value.replace(/\[[^\]]+]$/, '') : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
}

export function truncate(value, max = 34) {
  if (!value || value.length <= max) return value
  return `${value.slice(0, max - 1).trimEnd()}…`
}
