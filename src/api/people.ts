import { api } from './client'
import { mediaUrl } from '../lib/mediaUrl'

export interface RegisteredPerson {
  id: number
  nick: string
  avatar: string
}

interface PersonPayload {
  id: number
  nick: string
  avatar: string | null
}

interface Envelope {
  data: PersonPayload[]
}

export async function fetchPeople(search = ''): Promise<RegisteredPerson[]> {
  const response = await api.get<Envelope>('/people', {
    params: search.trim() === '' ? {} : { q: search.trim() },
  })

  return response.data.data.map((person) => ({
    id: person.id,
    nick: person.nick,
    avatar: mediaUrl(person.avatar),
  }))
}
