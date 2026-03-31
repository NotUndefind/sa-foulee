'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

let _nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_nextId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const COLORS: Record<ToastType, string> = {
    success: 'bg-accent text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-zinc-700 text-white',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Pile de toasts */}
      <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in slide-in-from-bottom-2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg duration-200 ${COLORS[t.type]}`}
          >
            {t.type === 'success' && <span>✓</span>}
            {t.type === 'error' && <span>✕</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
