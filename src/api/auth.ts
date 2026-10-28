import axios from 'axios'
import { api } from './client'

export interface AuthUser {
  id: number
  nick: string
  avatar?: string | null
  cover?: string | null
}

export interface AuthSession {
  user: AuthUser
  token: string
}

interface AuthEnvelope {
  data: AuthSession
}

export interface RegisterPayload {
  name: string
  email: string
  nick: string
  department: string
  birth_year: number
  password: string
  password_confirmation: string
  consent_terms: boolean
  consent_metrics: boolean
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthSession> {
  const response = await api.post<AuthEnvelope>('/auth/register', payload)

  return response.data.data
}

export async function loginAccount(nick: string, password: string): Promise<AuthSession> {
  const response = await api.post<AuthEnvelope>('/auth/login', { nick, password })

  return response.data.data
}

export async function logoutAccount(): Promise<void> {
  await api.post('/auth/logout')
}

export async function updateAvatar(file: File): Promise<AuthUser> {
  const form = new FormData()
  form.append('avatar', file)
  const response = await api.post<{ data: AuthUser }>('/me/avatar', form)

  return response.data.data
}

export async function updateCover(file: File): Promise<AuthUser> {
  const form = new FormData()
  form.append('cover', file)
  const response = await api.post<{ data: AuthUser }>('/me/cover', form)

  return response.data.data
}

export async function deleteAccount(nick: string): Promise<void> {
  await api.delete('/me', { data: { nick } })
}

export function readApiErrors(error: unknown): Record<string, string[]> {
  if (!axios.isAxiosError(error)) {
    return {}
  }

  const payload: unknown = error.response?.data
  if (typeof payload !== 'object' || payload === null || !('errors' in payload)) {
    return {}
  }

  const errors = payload.errors
  if (typeof errors !== 'object' || errors === null) {
    return {}
  }

  const result: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(errors)) {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      result[key] = value
    }
  }

  return result
}

export function firstApiMessage(errors: Record<string, string[]>): string {
  const first = Object.values(errors).flat()[0]
  if (first) {
    return first
  }

  return 'No se pudo completar la solicitud.'
}
