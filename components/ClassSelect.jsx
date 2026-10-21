import { dayName, to12h } from '@/lib/format'

export const classLabel = (c) => `${c.subject_code} ${c.subject_name} (${dayName(c.day_of_week).slice(0, 3)} ${to12h(c.start_time)})`

export default function ClassSelect({ schedules, value, onChange, allLabel }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {allLabel && <option value="">{allLabel}</option>}
      {schedules.map((c) => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
    </select>
  )
}
