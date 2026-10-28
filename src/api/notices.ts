import { api } from './client'

export interface ActivityNotice {
  id: number
  kind: 'argument' | 'reply'
  author_nick: string
  debate_id: number | null
  read: boolean
  created_at: string
}

interface Envelope<T> {
  data: T
  meta?: {
    unread?: number
  }
}

export async function fetchNotices(): Promise<{ items: ActivityNotice[]; unread: number }> {
  const response = await api.get<Envelope<ActivityNotice[]>>('/me/notices')

  return {
    items: response.data.data,
    unread: response.data.meta?.unread ?? 0,
  }
}

export async function markNoticeRead(id: number): Promise<number> {
  const response = await api.post<Envelope<{ id: number; read: boolean }>>(`/me/notices/${id}/read`)

  return response.data.meta?.unread ?? 0
}
