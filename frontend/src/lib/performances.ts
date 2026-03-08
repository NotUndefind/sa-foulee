import { api } from './api'
import type { Performance, LeaderboardEntry } from '@/types'

export type LeaderboardPeriod = 'week' | 'month' | 'season'

export interface UserPerformancesMeta {
  current_page: number
  last_page: number
  total: number
  total_distance: number
  total_sessions: number
}

export interface PaginatedPerformances {
  data: Performance[]
  meta: UserPerformancesMeta
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  period: LeaderboardPeriod
}

export interface PerformancePayload {
  distance_km: number
  duration_sec: number
  elevation_m?: number | null
  date: string
}

export async function getLeaderboard(period: LeaderboardPeriod = 'month'): Promise<LeaderboardResponse> {
  return api.get<LeaderboardResponse>(`/leaderboard?period=${period}`)
}

export async function getUserPerformances(userId: number, page = 1): Promise<PaginatedPerformances> {
  return api.get<PaginatedPerformances>(`/users/${userId}/performances?page=${page}`)
}

export async function addPerformance(payload: PerformancePayload): Promise<Performance> {
  return api.post<Performance>('/performances', payload)
}
