import { api } from './client'

export interface SearchDebate {
  id: number
  body: string
  author_nick: string | null
}

export interface SearchNews {
  id: number
  title: string
  source: string
}

export interface SearchPoll {
  id: number
  title: string
  place: string
}

export interface SearchResults {
  debates: SearchDebate[]
  news: SearchNews[]
  polls: SearchPoll[]
}

interface Envelope {
  data: SearchResults
}

export async function searchPublic(term: string): Promise<SearchResults> {
  const response = await api.get<Envelope>('/search', { params: { q: term } })

  return response.data.data
}
