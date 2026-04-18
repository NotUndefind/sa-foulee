import { api } from '@/lib/api'
import type { BudgetEntry, BudgetListResponse, BudgetSummary } from '@/types'

export interface BudgetFilters {
  type?: 'recette' | 'depense'
  category?: string
  from?: string
  to?: string
  per_page?: number
  page?: number
}

export function getBudgetEntries(filters?: BudgetFilters): Promise {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.category) params.set('category', filters.category)
  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)
  if (filters?.per_page) params.set('per_page', String(filters.per_page))
  if (filters?.page) params.set('page', String(filters.page))
  const qs = params.toString()
  return api.get<BudgetListResponse>(`/budget${qs ? `?${qs}` : ''}`)
}

export function getBudgetSummary(): Promise {
  return api.get<BudgetSummary>('/budget/summary')
}

export function createBudgetEntry(data: {
  type: 'recette' | 'depense'
  category: string
  amount: number
  description?: string
  entry_date: string
  receipt_url?: string
}): Promise {
  return api.post<BudgetEntry>('/budget', data)
}

export function updateBudgetEntry(id: number, data: Partial): Promise {
  return api.patch<BudgetEntry>(`/budget/${id}`, data)
}

export function deleteBudgetEntry(id: number): Promise {
  return api.delete(`/budget/${id}`)
}

export async function exportBudgetCSV(from?: string, to?: string): Promise {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  const res = await fetch(`${baseUrl}/budget/export${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
  })
  if (!res.ok) throw new Error('Export échoué')

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `budget-safoulee-${from ?? date}-${to ?? date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
