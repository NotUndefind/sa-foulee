import { api } from './api'
import type { Equipment, EquipmentCategory, EquipmentStatus } from '@/types'

export interface EquipmentPayload {
  name: string
  category: EquipmentCategory
  quantity: number
  status: EquipmentStatus
  notes?: string | null
}

export function getInventory(params?: { category?: string; status?: string }): Promise<Equipment[]> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.status)   qs.set('status',   params.status)
  const query = qs.toString() ? `?${qs}` : ''
  return api.get<Equipment[]>(`/inventory${query}`)
}

export function createEquipment(data: EquipmentPayload): Promise<Equipment> {
  return api.post<Equipment>('/inventory', data)
}

export function updateEquipment(id: number, data: Partial<EquipmentPayload>): Promise<Equipment> {
  return api.patch<Equipment>(`/inventory/${id}`, data)
}

export function deleteEquipment(id: number): Promise<void> {
  return api.delete<void>(`/inventory/${id}`)
}

export async function exportInventoryCSV(): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const res   = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/inventory/export`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' } }
  )
  if (!res.ok) throw new Error('Export failed')
  const blob     = await res.blob()
  const url      = URL.createObjectURL(blob)
  const a        = document.createElement('a')
  a.href         = url
  a.download     = `inventaire-safoulee-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
