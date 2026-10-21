export const TZ = 'Asia/Manila'

// day_of_week = 0 → Monday
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Same colors and labels as the kiosk screen
export const STATUS = {
  on_time: { label: 'ON TIME', color: '#66bb6a' },
  late: { label: 'LATE', color: '#ffa726' },
  absent: { label: 'ABSENT', color: '#ef5350' },
  pending: { label: 'NOT YET', color: '#9aa0a6' },
}

// Table names in one place. Confirm these with Teammate 1 and edit here if they differ.
export const T = {
  profiles: 'profiles',
  students: 'students',
  rooms: 'rooms',
  schedules: 'class_schedules',
  enrollments: 'enrollments',
  records: 'attendance_records',
  kiosks: 'kiosks',
  audit: 'attendance_audit_log',
}
