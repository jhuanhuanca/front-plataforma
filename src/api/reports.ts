import axios from 'axios'
import { api } from './client'
import { firstApiMessage, readApiErrors } from './auth'

export type ReportTarget = 'debate' | 'argument' | 'news'

export type ReportReason = 'insulto' | 'dato_falso' | 'fuera_de_tema' | 'spam' | 'datos_personales'

export async function createReport(input: {
  targetType: ReportTarget
  targetId: string
  reason: ReportReason
  body: string
}): Promise<void> {
  await api.post('/reports', {
    target_type: input.targetType,
    target_id: Number(input.targetId),
    reason: input.reason,
    body: input.body.trim() === '' ? null : input.body.trim(),
  })
}

export function reportError(cause: unknown): string {
  if (!axios.isAxiosError(cause) || !cause.response) {
    return 'No se pudo conectar con el servidor.'
  }

  return firstApiMessage(readApiErrors(cause))
}
