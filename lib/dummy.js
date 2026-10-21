import { addDays, todayISO } from './format'

const names = [
  ['Angelo Bautista', 'BSIT 3-A'], ['Bea Villanueva', 'BSIT 3-A'], ['Carlo Mendoza', 'BSIT 3-A'],
  ['Dina Aquino', 'BSIT 3-B'], ['Elena Ramos', 'BSIT 3-B'], ['Francis Lim', 'BSIT 3-B'],
  ['Gina Navarro', 'BSIT 3-A'], ['Hanz Castillo', 'BSIT 3-B'],
]

const students = names.map(([full_name, course_year_section], i) => ({
  id: 's' + (i + 1),
  student_number: `2024-${String(i + 1).padStart(4, '0')}`,
  full_name,
  course_year_section,
  is_active: i !== 7 ? true : false,
}))

const teachers = [
  { id: 't1', full_name: 'Ms. Reyes', email: 'reyes@school.test', is_active: true },
  { id: 't2', full_name: 'Mr. Santos', email: 'santos@school.test', is_active: true },
]

const rooms = [
  { id: 'r1', name: 'Room 301', location: 'Main Building' },
  { id: 'r2', name: 'Room 204', location: 'Main Building' },
  { id: 'r3', name: 'Computer Lab 2', location: 'Annex' },
]

const schedules = [
  { id: 'c1', teacher_id: 't1', room_id: 'r1', subject_code: 'IT301', subject_name: 'Web Systems', day_of_week: 0, start_time: '08:00', end_time: '10:00' },
  { id: 'c2', teacher_id: 't1', room_id: 'r2', subject_code: 'IT305', subject_name: 'Database Management', day_of_week: 2, start_time: '10:00', end_time: '12:00' },
  { id: 'c3', teacher_id: 't2', room_id: 'r1', subject_code: 'IT310', subject_name: 'Capstone Project 1', day_of_week: 2, start_time: '13:30', end_time: '15:30' },
  { id: 'c4', teacher_id: 't2', room_id: 'r3', subject_code: 'IT302', subject_name: 'Computer Networks', day_of_week: 4, start_time: '09:00', end_time: '11:00' },
]

const enrollments = []
schedules.forEach((c, ci) =>
  students.forEach((s, si) => {
    if (s.is_active && (ci % 2 === 0 || si % 3 !== 0)) enrollments.push({ schedule_id: c.id, student_id: s.id })
  })
)

function makeRecords() {
  const out = []
  const today = todayISO()
  schedules.forEach((c) => {
    const ids = enrollments.filter((e) => e.schedule_id === c.id).map((e) => e.student_id)
    for (let back = 0; back < 5; back++) {
      const date = addDays(today, -back)
      ids.forEach((sid, i) => {
        const pattern = (i + back) % 5
        if (pattern === 0) return // never scanned
        const [h, m] = c.start_time.split(':').map(Number)
        const late = pattern === 1
        const mins = h * 60 + m + (late ? 12 : -6)
        const hh = String(Math.floor(mins / 60)).padStart(2, '0')
        const mm = String(mins % 60).padStart(2, '0')
        out.push({
          id: `rec-${c.id}-${sid}-${date}`, schedule_id: c.id, student_id: sid, session_date: date,
          status: late ? 'late' : 'on_time', scanned_at: `${date}T${hh}:${mm}:00+08:00`,
          corrected_by: null, correction_reason: null,
        })
      })
    }
  })
  return out
}

export const db = {
  students, teachers, rooms, schedules, enrollments,
  records: makeRecords(),
  audit: [
    { id: 'a1', created_at: new Date(Date.now() - 86400000).toISOString(), corrected_by_name: 'Ms. Reyes', student_name: 'Carlo Mendoza', subject_code: 'IT301', session_date: addDays(todayISO(), -1), old_status: 'absent', new_status: 'late', reason: 'Was at the registrar; arrived after the scan window.' },
  ],
}

export function dummyKiosks() {
  const now = Date.now()
  return [
    { device_name: 'Room 301 Kiosk', last_seen_at: new Date(now - 25 * 1000).toISOString(), is_active: true },
    { device_name: 'Computer Lab 2 Kiosk', last_seen_at: new Date(now - 18 * 60 * 1000).toISOString(), is_active: true },
  ]
}
