import { api } from './client'

export interface AccountStanding {
  silenced: boolean
  until: string | null
}

interface Envelope {
  data: AccountStanding
}

export async function fetchStanding(): Promise<AccountStanding> {
  const response = await api.get<Envelope>('/me/standing')

  return response.data.data
}
