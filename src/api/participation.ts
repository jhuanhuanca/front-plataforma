import { api } from './client'

export interface Participation {
  consent: boolean
  debates?: number
  arguments?: number
  votes?: number
  argument_votes?: number
  reactions?: number
  participation?: number
  quality?: number
  respect?: number
  influence?: number
  candidate?: boolean
}

interface Envelope<T> {
  data: T
}

export async function fetchParticipation(): Promise<Participation> {
  const response = await api.get<Envelope<Participation>>('/me/participation')

  return response.data.data
}

export async function updateMetricsConsent(consent: boolean): Promise<Participation> {
  const response = await api.post<Envelope<Participation>>('/me/participation/consent', {
    consent_metrics: consent,
  })

  return response.data.data
}
