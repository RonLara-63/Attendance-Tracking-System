import { DAYS, TZ } from './constants'

export function to12h(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
}
export const hhmm = (t) => (t || '').slice(0, 5) // '08:00:00' → '08:00'
export const timeRange = (s, e) => `${to12h(s)} – ${to12h(e)}`
export const dayName = (i) => DAYS[i] ?? '—'

// Today's date in Philippine time as YYYY-MM-DD.
// (toISOString() gives the UTC date, which is "yesterday" before 8:00 AM in the Philippines.)
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}
export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
// Monday = 0 … Sunday = 6, matching day_of_week
export function todayWeekday() {
  const w = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(new Date())
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(w)
}
export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-PH', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
}
export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-PH', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' })
}
export function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-PH', {
    timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// A kiosk is "online" if it was seen within the last 2 minutes
export function isOnline(lastSeen) {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < 2 * 60 * 1000
}
export function timeAgo(iso) {
  if (!iso) return 'never'
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  return `${Math.floor(s / 86400)} days ago`
}
