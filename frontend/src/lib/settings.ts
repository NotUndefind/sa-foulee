import { api } from './api'

export interface PublicSettings {
  leaderboard_enabled?: string
  [key: string]: string | undefined
}

export interface AdminSetting {
  key: string
  value: string | null
  is_public: boolean
  updated_by: number | null
  updated_at: string | null
}

export function getPublicSettings(): Promise<PublicSettings> {
  return api.get<PublicSettings>('/settings/public')
}

export function getAdminSettings(): Promise<AdminSetting[]> {
  return api.get<AdminSetting[]>('/admin/settings')
}

export function updateSetting(key: string, value: string): Promise<{ key: string; value: string }> {
  return api.patch(`/admin/settings/${key}`, { value })
}
