'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, DUMMY } from './supabase'
import { T } from './constants'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export const homeFor = (role) =>
  role === 'super_admin' ? '/admin/dashboard' : role === 'teacher' ? '/teacher/classes' : '/login'

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, profile: null })

  useEffect(() => {
    if (DUMMY) {
      const raw = sessionStorage.getItem('dummy_session')
      if (raw) {
        const p = JSON.parse(raw)
        setState({ loading: false, user: { id: p.id, email: p.email }, profile: p })
      } else setState({ loading: false, user: null, profile: null })
      return
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) return setState({ loading: false, user: null, profile: null })
      const { data: profile } = await supabase.from(T.profiles).select('*').eq('id', user.id).single()
      setState({ loading: false, user: profile ? user : null, profile: profile ?? null })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setState({ loading: false, user: null, profile: null })
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (DUMMY) {
      const isAdmin = email.toLowerCase().includes('admin')
      const profile = isAdmin
        ? { id: 'admin1', email, role: 'super_admin', full_name: 'Dummy Admin' }
        : { id: 't1', email, role: 'teacher', full_name: 'Ms. Reyes' }
      sessionStorage.setItem('dummy_session', JSON.stringify(profile))
      setState({ loading: false, user: { id: profile.id, email }, profile })
      return { profile }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'Wrong email or password. Check both and try again.' }
    const { data: profile } = await supabase.from(T.profiles).select('*').eq('id', data.session.user.id).single()
    if (!profile || profile.is_active === false) {
      await supabase.auth.signOut()
      return { error: 'This account is not active. Ask an administrator for access.' }
    }
    setState({ loading: false, user: data.session.user, profile })
    return { profile }
  }, [])

  const signOut = useCallback(async () => {
    if (DUMMY) sessionStorage.removeItem('dummy_session')
    else await supabase.auth.signOut()
    setState({ loading: false, user: null, profile: null })
  }, [])

  return <Ctx.Provider value={{ ...state, signIn, signOut }}>{children}</Ctx.Provider>
}
