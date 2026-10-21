# Attendance Dashboard (Teammate 2: frontend)

Next.js 14 (App Router) + Tailwind + `@supabase/supabase-js`.

## Run it

```bash
npm install
cp .env.local.example .env.local     # keep NEXT_PUBLIC_USE_DUMMY=true to start
npm run dev                          # http://localhost:3000
```

**Dummy mode** (`NEXT_PUBLIC_USE_DUMMY=true`): no Supabase needed. Sign in with any email.
An email containing `admin` signs in as super_admin; anything else is a teacher (Ms. Reyes).
Data resets when you refresh the page.

**Going live:** fill in the Supabase URL and anon key, set `NEXT_PUBLIC_USE_DUMMY=false`, restart.
All data access is in `lib/api.js`, so no page code changes are needed.

## Structure

```
app/login                     Login
app/admin/*                   dashboard, students, teachers, rooms, classes (+ [id]/enroll),
                              attendance, export, audit-log, profile
app/teacher/*                 classes, attendance, export, profile
components/AttendanceView     shared by both roles (merge logic, filters, correction flow)
components/ExportView         shared CSV export
lib/api.js                    every Supabase / API call lives here (dummy + real)
lib/constants.js              status colors, day names, TABLE NAMES
lib/attendance.js             enrolled + records merge
```

## Things to confirm with Teammate 1

1. **Table and column names.** `lib/constants.js` assumes `class_schedules`, `rooms(name, location)`,
   `profiles(role, full_name, email, is_active)`, `attendance_audit_log`. Edit `T` there if they differ.
2. **Auth on /api routes.** The frontend sends `Authorization: Bearer <access_token>` because
   supabase-js keeps the session in localStorage, not cookies.
3. **Correcting a student with no scan.** Absent / "not yet" students have no record id, so the UI calls
   `POST /api/attendance` with `{schedule_id, student_id, session_date, status, reason}`. Need that route.
4. **`POST /api/teachers`** with `{full_name, email, password}` (creating an auth user needs service_role).
   Deactivating a teacher updates `profiles.is_active` directly; ideally the route also blocks sign-in.
5. **Audit log columns.** The page expects `created_at, corrected_by_name, student_name, subject_code,
   session_date, old_status, new_status, reason`. A view or API that joins these would be easiest.
6. **`/api/export`** without `schedule_id` should return all classes the caller may see.

## Two small fixes to the briefing's snippets

- Dates use Philippine time (`todayISO()` in `lib/format.js`). `new Date().toISOString()` returns the UTC
  date, which is still "yesterday" between 12:00 AM and 8:00 AM in the Philippines.
- The attendance query also selects `student_id`; the merge logic needs it for `recordMap`.
