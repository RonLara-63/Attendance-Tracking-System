'use client'
import { createContext, useCallback, useContext, useState } from 'react'

const Ctx = createContext(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setItems((p) => [...p, { id, message, type }])
    setTimeout(() => setItems((p) => p.filter((i) => i.id !== id)), 4500)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-md border-l-4 bg-white px-4 py-3 shadow-lg ${t.type === 'error' ? 'border-danger' : 'border-status-ontime'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
