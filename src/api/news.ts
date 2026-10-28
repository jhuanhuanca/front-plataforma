import { api } from './client'
import { sideNews } from '../data/debates'

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  time: string
  debateId: string | null
}

interface NewsPayload {
  id: number
  title: string
  summary: string
  source: string
  published_at: string | null
  debate_id: number | null
}

interface Envelope<T> {
  data: T
}

export async function fetchNews(): Promise<NewsItem[]> {
  const response = await api.get<Envelope<NewsPayload[]>>('/news')

  return response.data.data.map(toItem)
}

export async function fetchNewsItem(id: string): Promise<NewsItem> {
  const response = await api.get<Envelope<NewsPayload>>(`/news/${id}`)

  return toItem(response.data.data)
}

export function localNews(): NewsItem[] {
  return sideNews.map((item) => ({
    id: item.id,
    title: item.title,
    summary: '',
    source: 'Edición local',
    time: item.time,
    debateId: null,
  }))
}

function toItem(item: NewsPayload): NewsItem {
  return {
    id: String(item.id),
    title: item.title,
    summary: item.summary,
    source: item.source,
    time: relativeTime(item.published_at),
    debateId: item.debate_id === null ? null : String(item.debate_id),
  }
}

function relativeTime(value: string | null): string {
  if (!value) {
    return 'ahora'
  }

  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) {
    return 'ahora'
  }
  if (minutes < 60) {
    return minutes === 1 ? '1 min' : `${minutes} min`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? '1 hora' : `${hours} horas`
  }

  const days = Math.round(hours / 24)

  return days === 1 ? '1 día' : `${days} días`
}
