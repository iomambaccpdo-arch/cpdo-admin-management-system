export function recordDateLabel(date) {
  const value = new Date(`${date}T00:00:00`)
  return value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function recordTitle(date) {
  const value = new Date(`${date}T00:00:00`)
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function cellDate(iso) {
  if (!iso) return '-'
  const value = new Date(iso)
  const month = value.toLocaleDateString('en-US', { month: 'short' })
  const day = value.toLocaleDateString('en-US', { day: 'numeric' })
  const year = value.toLocaleDateString('en-US', { year: 'numeric' })
  const label = month === 'May' ? month : `${month}.`
  return `${label} ${day}, ${year}`
}

export function cellTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function modifiedLabel(iso) {
  if (!iso) return ''
  const value = new Date(iso)
  const now = new Date()
  const diffDays = (now.setHours(0, 0, 0, 0) - new Date(value).setHours(0, 0, 0, 0)) / 86400000
  if (diffDays >= 0 && diffDays < 7) {
    const weekday = value.toLocaleDateString('en-US', { weekday: 'short' })
    const time = value
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      .toLowerCase()
    return `${weekday} at ${time}`
  }
  const day = value.toLocaleDateString('en-GB', { day: 'numeric' })
  const month = value.toLocaleDateString('en-GB', { month: 'long' })
  return `${day} ${month}`
}

export function datePart(iso) {
  if (!iso) return ''
  const value = new Date(iso)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function timePart(iso) {
  if (!iso) return ''
  const value = new Date(iso)
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function todayInput() {
  return datePart(new Date().toISOString())
}
