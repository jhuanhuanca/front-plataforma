import { api } from './client'

export interface PublicMetrics {
  debates: number
  arguments: number
  votes: number
  news: number
  voices: number
}

interface Envelope<T> {
  data: T
}

export async function fetchMetrics(): Promise<PublicMetrics> {
  const response = await api.get<Envelope<PublicMetrics>>('/metrics')

  return response.data.data
}
