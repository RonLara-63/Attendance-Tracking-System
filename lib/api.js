import { supabase, DUMMY } from './supabase'
import { T } from './constants'
import * as D from './dummy'
import { buildFullList } from './attendance'
import { todayISO, todayWeekday } from './format'

const check = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}
const later = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 150))
const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]))

// ---- Calls to Teammate 1's /api routes (sends the Supabase access token) ----
async function callApi(path, opts = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  })
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try { const j = await res.json(); msg = j.error || j.message || msg } catch {}
    throw new Error(msg)
  }
  return res
}

// ---- Students ----
export async function listStudents() {
  if (DUMMY) return later([...D.db.students].sort((a, b) => a.full_name.localeCompare(b.full_name)))
  return check(await supabase.from(T.students).select('*').order('full_name'))
}
export async function saveStudent(s) {
  const fields = pick(s, ['student_number', 'full_name', 'course_year_section'])
  if (DUMMY) {
    if (s.id) Object.assign(D.db.students.find((x) => x.id === s.id), fields)
    else D.db.students.push({ id: 's' + Date.now(), is_active: true, ...fields })
    return later(true)
  }
  const q = s.id ? supabase.from(T.students).update(fields).eq('id', s.id) : supabase.from(T.students).insert(fields)
  check(await q)
}
export async function setStudentActive(id, active) {
  if (DUMMY) { D.db.students.find((x) => x.id === id).is_active = active; return later(true) }
  check(await supabase.from(T.students).update({ is_active: active }).eq('id', id))
}

// ---- Teachers ----
export async function listTeachers() {
  if (DUMMY) return later(D.db.teachers)
  return check(await supabase.from(T.profiles).select('*').eq('role', 'teacher').order('full_name'))
}
export async function createTeacher({ full_name, email, password }) {
  if (DUMMY) { D.db.teachers.push({ id: 't' + Date.now(), full_name, email, is_active: true }); return later(true) }
  // Creating an auth user needs the service_role key, so it must go through Teammate 1's route.
  await callApi('/api/teachers', { method: 'POST', body: JSON.stringify({ full_name, email, password }) })
}
export async function setTeacherActive(id, active) {
  if (DUMMY) { D.db.teachers.find((x) => x.id === id).is_active = active; return later(true) }
  check(await supabase.from(T.profiles).update({ is_active: active }).eq('id', id))
}

// ---- Rooms ----
export async function listRooms() {
  if (DUMMY) return later(D.db.rooms)
  return check(await supabase.from(T.rooms).select('*').order('name'))
}
export async function saveRoom(r) {
  const fields = pick(r, ['name', 'location'])
  if (DUMMY) {
    if (r.id) Object.assign(D.db.rooms.find((x) => x.id === r.id), fields)
    else D.db.rooms.push({ id: 'r' + Date.now(), ...fields })
    return later(true)
  }
  const q = r.id ? supabase.from(T.rooms).update(fields).eq('id', r.id) : supabase.from(T.rooms).insert(fields)
  check(await q)
}

// ---- Class schedules ----
const bySlot = (a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
export async function listSchedules({ teacherId } = {}) {
  if (DUMMY) {
    return later(
      D.db.schedules
        .filter((s) => !teacherId || s.teacher_id === teacherId)
        .map((s) => ({
          ...s,
          room_name: D.db.rooms.find((r) => r.id === s.room_id)?.name,
          teacher_name: D.db.teachers.find((t) => t.id === s.teacher_id)?.full_name,
        }))
        .sort(bySlot)
    )
  }
  let q = supabase.from(T.schedules).select('*, rooms(name), profiles(full_name)').order('day_of_week').order('start_time')
  if (teacherId) q = q.eq('teacher_id', teacherId)
  return check(await q).map((s) => ({ ...s, room_name: s.rooms?.name, teacher_name: s.profiles?.full_name }))
}
export async function saveSchedule(s) {
  const fields = pick(s, ['subject_code', 'subject_name', 'room_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time'])
  if (DUMMY) {
    if (s.id) Object.assign(D.db.schedules.find((x) => x.id === s.id), fields)
    else D.db.schedules.push({ id: 'c' + Date.now(), ...fields })
    return later(true)
  }
  const q = s.id ? supabase.from(T.schedules).update(fields).eq('id', s.id) : supabase.from(T.schedules).insert(fields)
  check(await q)
}

// ---- Enrollment ----
export async function listEnrolled(scheduleId) {
  if (DUMMY) {
    return later(
      D.db.enrollments.filter((e) => e.schedule_id === scheduleId)
        .map((e) => ({ student_id: e.student_id, students: D.db.students.find((s) => s.id === e.student_id) }))
    )
  }
  return check(
    await supabase.from(T.enrollments).select('student_id, students(full_name, student_number, course_year_section)').eq('schedule_id', scheduleId)
  )
}
export async function enrollStudents(scheduleId, studentIds) {
  if (DUMMY) { studentIds.forEach((id) => D.db.enrollments.push({ schedule_id: scheduleId, student_id: id })); return later(true) }
  check(await supabase.from(T.enrollments).insert(studentIds.map((id) => ({ schedule_id: scheduleId, student_id: id }))))
}
export async function unenrollStudent(scheduleId, studentId) {
  if (DUMMY) {
    D.db.enrollments = D.db.enrollments.filter((e) => !(e.schedule_id === scheduleId && e.student_id === studentId))
    return later(true)
  }
  check(await supabase.from(T.enrollments).delete().eq('schedule_id', scheduleId).eq('student_id', studentId))
}

// ---- Attendance ----
export async function getAttendance(scheduleId, date) {
  if (DUMMY) {
    const enrolled = await listEnrolled(scheduleId)
    const records = D.db.records.filter((r) => r.schedule_id === scheduleId && r.session_date === date)
    return buildFullList(enrolled, records, date)
  }
  const [records, enrolled] = await Promise.all([
    supabase
      .from(T.records)
      .select('id, student_id, status, scanned_at, session_date, corrected_by, correction_reason, students (student_number, full_name, course_year_section)')
      .eq('schedule_id', scheduleId)
      .eq('session_date', date)
      .order('scanned_at', { ascending: true }),
    supabase.from(T.enrollments).select('student_id, students(full_name, student_number, course_year_section)').eq('schedule_id', scheduleId),
  ]).then((rs) => rs.map(check))
  return buildFullList(enrolled, records, date)
}

// Existing record → PUT /api/attendance/:id (Teammate 1 writes the audit log).
// Student with no record yet → POST /api/attendance (needs confirming with Teammate 1).
export async function correctAttendance({ recordId, scheduleId, studentId, date, status, reason, oldStatus, actor }) {
  if (DUMMY) {
    const r = recordId && D.db.records.find((x) => x.id === recordId)
    if (r) Object.assign(r, { status, corrected_by: actor?.id, correction_reason: reason })
    else D.db.records.push({ id: 'rec-' + Date.now(), schedule_id: scheduleId, student_id: studentId, session_date: date, status, scanned_at: null, corrected_by: actor?.id, correction_reason: reason })
    const st = D.db.students.find((s) => s.id === studentId)
    const sc = D.db.schedules.find((s) => s.id === scheduleId)
    D.db.audit.unshift({ id: 'a' + Date.now(), created_at: new Date().toISOString(), corrected_by_name: actor?.full_name, student_name: st?.full_name, subject_code: sc?.subject_code, session_date: date, old_status: oldStatus, new_status: status, reason })
    return later(true)
  }
  if (recordId) await callApi(`/api/attendance/${recordId}`, { method: 'PUT', body: JSON.stringify({ status, reason }) })
  else await callApi('/api/attendance', { method: 'POST', body: JSON.stringify({ schedule_id: scheduleId, student_id: studentId, session_date: date, status, reason }) })
}

// ---- CSV export ----
function save(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
export async function downloadCsv({ scheduleId, from, to, teacherId }) {
  const name = `attendance-${scheduleId || 'all'}-${from}.csv`
  if (DUMMY) {
    const head = 'student_number,full_name,course_year_section,subject_code,subject_name,session_date,status,scanned_at'
    const rows = D.db.records
      .filter((r) => (!scheduleId || r.schedule_id === scheduleId) && r.session_date >= from && r.session_date <= to)
      .map((r) => ({ r, c: D.db.schedules.find((c) => c.id === r.schedule_id), s: D.db.students.find((s) => s.id === r.student_id) }))
      .filter(({ c }) => !teacherId || c.teacher_id === teacherId)
      .map(({ r, c, s }) => [s.student_number, `"${s.full_name}"`, s.course_year_section, c.subject_code, `"${c.subject_name}"`, r.session_date, r.status, r.scanned_at ?? ''].join(','))
    return save(new Blob([[head, ...rows].join('\n')], { type: 'text/csv' }), name)
  }
  const qs = new URLSearchParams({ from, to })
  if (scheduleId) qs.set('schedule_id', scheduleId)
  const res = await callApi(`/api/export?${qs}`)
  save(await res.blob(), name)
}

// ---- Audit log ----
export async function listAudit() {
  if (DUMMY) return later(D.db.audit)
  return check(await supabase.from(T.audit).select('*').order('created_at', { ascending: false }).limit(200))
}

// ---- Dashboard ----
export async function listKiosks() {
  if (DUMMY) return later(D.dummyKiosks())
  return check(await supabase.from(T.kiosks).select('device_name, last_seen_at, is_active'))
}
export async function getDashboard() {
  const [students, schedules, kiosks] = await Promise.all([listStudents(), listSchedules(), listKiosks()])
  return {
    studentCount: students.filter((s) => s.is_active !== false).length,
    todayClasses: schedules.filter((s) => s.day_of_week === todayWeekday()),
    kiosks,
  }
}

// ---- Password ----
export async function changePassword(newPassword) {
  if (DUMMY) return later(true)
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

export { todayISO }
