import { todayISO } from './format'

// Students who never scan have no row in attendance_records, so merge the
// enrolled list with the records to get a complete list.
export function buildFullList(enrolled, records, selectedDate) {
  const recordMap = Object.fromEntries(records.map((r) => [r.student_id, r]))
  const today = todayISO()
  return enrolled
    .map((e) => {
      const r = recordMap[e.student_id]
      return {
        student_id: e.student_id,
        student_number: e.students?.student_number ?? '',
        full_name: e.students?.full_name ?? '',
        course_year_section: e.students?.course_year_section ?? '',
        status: r?.status ?? (selectedDate < today ? 'absent' : 'pending'),
        scanned_at: r?.scanned_at ?? null,
        record_id: r?.id ?? null,
        was_corrected: !!r?.corrected_by,
        correction_reason: r?.correction_reason ?? null,
      }
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
}
