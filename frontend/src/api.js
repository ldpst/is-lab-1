const deploymentRoot = import.meta.env.DEV ? '' : window.location.pathname.replace(/\/[^/]*$/, '')

export const API_ROOT = `${deploymentRoot}/api`

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: options.body
      ? { 'Content-Type': 'application/json', ...options.headers }
      : options.headers,
    ...options,
  })

  if (!response.ok) {
    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    const details =
      Array.isArray(body?.details) && body.details.length ? `: ${body.details.join('; ')}` : ''
    const message =
      body?.message || body?.error
        ? `${body.message || body.error}${details}`
        : `Ошибка запроса (${response.status})`
    throw new ApiError(message, response.status, body)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export function ticketsQuery(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value)
  })
  return `/tickets?${query}`
}

export async function loadAllTickets() {
  const first = await api.get(ticketsQuery({ page: 0, size: 100, sort: 'id', direction: 'asc' }))
  if (first.totalPages <= 1) return first.items
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      api.get(ticketsQuery({ page: index + 1, size: 100, sort: 'id', direction: 'asc' })),
    ),
  )
  return [first, ...rest].flatMap((page) => page.items)
}

export function updatesUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const root = import.meta.env.DEV ? '' : deploymentRoot
  return `${protocol}//${window.location.host}${root}/updates`
}
