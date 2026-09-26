import { useEffect, useRef } from 'react'
import { formatMoney, truncate } from '../utils'

export function BubbleField({ tickets, selectedId, onSelect, onEdit }) {
  const fieldRef = useRef(null)
  const bubbleRefs = useRef(new Map())

  useEffect(() => {
    const field = fieldRef.current
    if (!field || !tickets.length) return undefined

    let animationFrame = 0
    let bodies = []
    let lastFrame = performance.now()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const createBodies = () => {
      const width = field.clientWidth
      const height = field.clientHeight
      const prices = tickets.map((ticket) => Math.log1p(ticket.price))
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const range = Math.max(.001, maxPrice - minPrice)
      const areaBudget = width * height * .42
      const unitRadius = Math.sqrt(areaBudget / (Math.PI * tickets.length))
      const minRadius = clamp(unitRadius * .55, 18, 40)
      const maxRadius = clamp(unitRadius * 1.45, minRadius + 12, Math.min(98, width / 4, height / 4))

      bodies = tickets.map((ticket, index) => {
        const ratio = tickets.length === 1 ? .5 : (Math.log1p(ticket.price) - minPrice) / range
        const radius = minRadius + (maxRadius - minRadius) * Math.sqrt(ratio)
        const random = seededRandom(ticket.id * 7919 + index)
        return {
          id: ticket.id,
          radius,
          x: radius + random() * Math.max(1, width - radius * 2),
          y: radius + random() * Math.max(1, height - radius * 2),
          vx: (random() - .5) * .16,
          vy: (random() - .5) * .16,
          phase: random() * Math.PI * 2,
        }
      })

      const totalArea = bodies.reduce((sum, body) => sum + Math.PI * body.radius ** 2, 0)
      if (totalArea > areaBudget) {
        const scale = Math.sqrt(areaBudget / totalArea)
        bodies.forEach((body) => { body.radius = Math.max(15, body.radius * scale) })
      }

      for (let step = 0; step < 260; step += 1) resolveCollisions(bodies, width, height, false)
      paint(width, height)
    }

    const paint = (width, height) => {
      bodies.forEach((body) => {
        const element = bubbleRefs.current.get(body.id)
        if (!element) return
        const diameter = body.radius * 2
        element.style.width = `${diameter}px`
        element.style.height = `${diameter}px`
        element.style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`
        element.style.opacity = '1'
        element.classList.toggle('compact-bubble', body.radius < 36)
        element.classList.toggle('tiny-bubble', body.radius < 27)
        body.x = clamp(body.x, body.radius, width - body.radius)
        body.y = clamp(body.y, body.radius, height - body.radius)
      })
    }

    const animate = (now) => {
      const width = field.clientWidth
      const height = field.clientHeight
      const delta = Math.min(2, (now - lastFrame) / 16.67)
      lastFrame = now

      if (!reduceMotion) {
        bodies.forEach((body) => {
          body.vx += Math.sin(now * .00035 + body.phase) * .0012
          body.vy += Math.cos(now * .0003 + body.phase) * .0012
          const speed = Math.hypot(body.vx, body.vy)
          if (speed > .18) { body.vx *= .18 / speed; body.vy *= .18 / speed }
          body.x += body.vx * delta
          body.y += body.vy * delta
        })
        resolveCollisions(bodies, width, height, true)
        paint(width, height)
      }
      animationFrame = requestAnimationFrame(animate)
    }

    const observer = new ResizeObserver(createBodies)
    observer.observe(field)
    createBodies()
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [tickets])

  return <div className="bubble-field panel" ref={fieldRef}>
    {tickets.map((ticket) => <button
      key={ticket.id}
      ref={(element) => element ? bubbleRefs.current.set(ticket.id, element) : bubbleRefs.current.delete(ticket.id)}
      className={`ticket-bubble ${selectedId === ticket.id ? 'selected' : ''} ${(ticket.discount || 0) >= 68 ? 'high-discount' : ''}`}
      style={{ '--discount': `${ticket.discount || 0}%` }}
      onClick={() => onSelect(ticket)}
      onDoubleClick={() => onEdit(ticket)}
      title="Нажмите для выбора, дважды — для редактирования"
    >
      <span className="bubble-id">#{ticket.id}</span>
      <strong>{truncate(ticket.name, 20)}</strong>
      <span className="bubble-price">{formatMoney(ticket.price)}</span>
      <b>{ticket.discount ? `−${ticket.discount}%` : '0%'}</b>
    </button>)}
  </div>
}

function resolveCollisions(bodies, width, height, bounce) {
  const gap = 4
  for (let i = 0; i < bodies.length; i += 1) {
    const first = bodies[i]
    for (let j = i + 1; j < bodies.length; j += 1) {
      const second = bodies[j]
      let dx = second.x - first.x
      let dy = second.y - first.y
      let distance = Math.hypot(dx, dy)
      const minimum = first.radius + second.radius + gap
      if (distance >= minimum) continue
      if (distance < .001) { dx = 1; dy = 0; distance = 1 }
      const nx = dx / distance
      const ny = dy / distance
      const overlap = (minimum - distance) / 2
      first.x -= nx * overlap; first.y -= ny * overlap
      second.x += nx * overlap; second.y += ny * overlap
      if (bounce) {
        const relative = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny
        if (relative < 0) {
          const impulse = relative * .75
          first.vx += nx * impulse; first.vy += ny * impulse
          second.vx -= nx * impulse; second.vy -= ny * impulse
        }
      }
    }
  }

  bodies.forEach((body) => {
    if (body.x < body.radius) { body.x = body.radius; body.vx = Math.abs(body.vx) }
    if (body.x > width - body.radius) { body.x = width - body.radius; body.vx = -Math.abs(body.vx) }
    if (body.y < body.radius) { body.y = body.radius; body.vy = Math.abs(body.vy) }
    if (body.y > height - body.radius) { body.y = height - body.radius; body.vy = -Math.abs(body.vy) }
  })
}

function seededRandom(seed) {
  let value = seed % 2147483647
  return () => {
    value = value * 16807 % 2147483647
    return (value - 1) / 2147483646
  }
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
