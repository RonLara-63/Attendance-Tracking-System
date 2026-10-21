import { createClient } from '@supabase/supabase-js'

// Dummy mode lets you build and style every page without Supabase or Teammate 1's routes.
export const DUMMY = process.env.NEXT_PUBLIC_USE_DUMMY === 'true'

export const supabase = DUMMY
  ? null
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
