'use client'
import { useCallback, useEffect, useState } from 'react'

// Runs an async function, tracks loading/error, and exposes reload().
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => {
    let cancelled = false
    setState((p) => ({ ...p, loading: true, error: null }))
    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e.message || String(e) }))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => run(), [run])
  return { ...state, reload: () => { run() } }
}
