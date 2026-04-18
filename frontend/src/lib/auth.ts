import { api } from '@/lib/api'
import type { User } from '@/types'

// ---- Types ----

export type RegisterPayload = {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  consent: boolean
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthResponse = {
  user: User
  token: string
}

// ---- API calls ----

export async function register(payload: RegisterPayload): Promise {
  return api.post<AuthResponse>('/auth/register', payload)
}

export async function login(payload: LoginPayload): Promise {
  return api.post<AuthResponse>('/auth/login', payload)
}

export async function logout(): Promise {
  await api.post('/auth/logout')
  localStorage.removeItem('auth_token')
}

export async function forgotPassword(email: string): Promise {
  return api.post('/auth/forgot-password', { email })
}

export async function resetPassword(payload: {
  token: string
  email: string
  password: string
  password_confirmation: string
}): Promise {
  return api.post('/auth/reset-password', payload)
}
