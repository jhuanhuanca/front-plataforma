import { api } from './client'
import { mediaUrl } from '../lib/mediaUrl'

export interface HeroSlot {
  announcement: string
  kind: '' | 'image' | 'video'
  media: string
}

export interface HeroSet {
  home: HeroSlot
  polls: HeroSlot
}

interface Payload {
  announcement: string | null
  kind: 'image' | 'video' | null
  media: string | null
}

const empty: HeroSlot = { announcement: '', kind: '', media: '' }

export async function fetchHeroes(): Promise<HeroSet> {
  const response = await api.get<{ data: { home: Payload; polls: Payload } }>('/heroes')

  return {
    home: mapSlot(response.data.data.home),
    polls: mapSlot(response.data.data.polls),
  }
}

function mapSlot(slot: Payload | undefined): HeroSlot {
  if (!slot) {
    return empty
  }

  const kind = slot.kind === 'image' || slot.kind === 'video' ? slot.kind : ''

  return {
    announcement: slot.announcement ?? '',
    kind,
    media: kind === '' ? '' : mediaUrl(slot.media),
  }
}
