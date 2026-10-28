import axios from 'axios'
import { api } from './client'
import { firstApiMessage, readApiErrors } from './auth'

export interface ConversationItem {
  id: number
  nick: string | null
  last_body: string | null
  last_at: string | null
}

export interface DirectMessageItem {
  id: number
  body: string
  mine: boolean
  created_at: string | null
}

interface Envelope<T> {
  data: T
  meta?: {
    latest?: number
    more?: boolean
  }
}

export async function fetchConversations(): Promise<ConversationItem[]> {
  const response = await api.get<Envelope<ConversationItem[]>>('/conversations')

  return response.data.data
}

export async function openConversation(nick: string): Promise<ConversationItem> {
  const response = await api.post<Envelope<ConversationItem>>('/conversations', { nick })

  return response.data.data
}

export async function fetchMessages(id: number, after: number): Promise<{
  items: DirectMessageItem[]
  latest: number
  more: boolean
}> {
  const response = await api.get<Envelope<DirectMessageItem[]>>(`/conversations/${id}/messages`, {
    params: { after },
  })

  return {
    items: response.data.data,
    latest: response.data.meta?.latest ?? after,
    more: response.data.meta?.more === true,
  }
}

export async function sendMessage(id: number, body: string): Promise<DirectMessageItem> {
  const response = await api.post<Envelope<DirectMessageItem>>(`/conversations/${id}/messages`, { body })

  return response.data.data
}

export function conversationError(cause: unknown): string {
  if (!axios.isAxiosError(cause) || !cause.response) {
    return 'No se pudo conectar con el servidor.'
  }

  if (cause.response.status === 429) {
    return 'Hay demasiados mensajes seguidos. Espera un momento.'
  }

  return firstApiMessage(readApiErrors(cause))
}
