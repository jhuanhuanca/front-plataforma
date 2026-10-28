import { mediaUrl } from '../lib/mediaUrl'
import { api } from './client'
import { photo } from '../data/images'
import type { DebateComment, DebatePost } from '../data/debates'

interface DebateAuthor {
  nick: string | null
  avatar?: string | null
}

interface DebateArgumentPayload {
  id: number
  topic_id: number
  parent_id: number | null
  body: string
  likes: number
  liked: boolean
  created_at: string | null
  author: DebateAuthor
  favor: number
  contra: number
  stance: 'favor' | 'contra' | null
  replies: DebateArgumentPayload[]
}

export interface DebatePayload {
  id: number
  body: string
  image: string | null
  kind: string
  context: string | null
  likes: number
  shares: number
  liked: boolean
  closed?: boolean
  featured?: boolean
  created_at: string | null
  author: DebateAuthor
  arguments: DebateArgumentPayload[]
}

interface Envelope<T> {
  data: T
  meta?: {
    latest?: number
    more?: boolean
  }
}

export interface LivePage<T> {
  items: T[]
  latest: number
  more: boolean
}

const knownNames: Record<string, string> = {
  clara_rivas: 'Clara Rivas',
  elena_cruz: 'Elena Cruz',
  luis_navarro: 'Luis Navarro',
  andres_palma: 'Andrés Palma',
  ivan_paredes: 'Iván Paredes',
  rosa_aguilar: 'Rosa Aguilar',
  marta_quispe: 'Marta Quispe',
}

const knownAvatars: Record<string, string> = {
  clara_rivas: photo('photo-1494790108377-be9c29b29330', 160),
  elena_cruz: photo('photo-1531123897727-8f129e1688ce', 160),
  luis_navarro: photo('photo-1507003211169-0a1dd7228f2d', 160),
  andres_palma: photo('photo-1500648767791-00dcc994a43e', 160),
  ivan_paredes: photo('photo-1506794778202-cad84cf45f1d', 160),
  rosa_aguilar: photo('photo-1438761681033-6461ffad8d80', 160),
  marta_quispe: photo('photo-1544005313-94ddf0286df2', 160),
}

export async function fetchDebates(): Promise<DebatePost[]> {
  const response = await api.get<Envelope<DebatePayload[]>>('/debates')

  return response.data.data.map(toPost)
}

export async function createDebate(
  body: string,
  media?: { kind: 'image' | 'video'; file: File | null; link: string },
): Promise<DebatePost> {
  if (media?.file) {
    const form = new FormData()
    form.append('body', body)
    form.append('kind', media.kind)
    form.append('media', media.file)
    const response = await api.post<Envelope<DebatePayload>>('/debates', form)

    return toPost(response.data.data)
  }

  const response = await api.post<Envelope<DebatePayload>>('/debates', {
    body,
    kind: media?.kind ?? 'image',
    image: media?.link.trim() ? media.link.trim() : null,
  })

  return toPost(response.data.data)
}

export async function fetchDebate(id: string): Promise<DebatePost> {
  const response = await api.get<Envelope<DebatePayload>>(`/debates/${id}`)

  return toPost(response.data.data)
}

export async function fetchNewerDebates(after: number): Promise<LivePage<DebatePost>> {
  const response = await api.get<Envelope<DebatePayload[]>>('/debates/newer', {
    params: { after },
  })

  return {
    items: response.data.data.map(toPost),
    latest: response.data.meta?.latest ?? after,
    more: response.data.meta?.more === true,
  }
}

export async function fetchLiveArguments(after: number): Promise<LivePage<DebateArgumentPayload>> {
  const response = await api.get<Envelope<DebateArgumentPayload[]>>('/arguments/newer', {
    params: { after },
  })

  return {
    items: response.data.data,
    latest: response.data.meta?.latest ?? after,
    more: response.data.meta?.more === true,
  }
}

export async function fetchDebateUpdates(id: string, after: number): Promise<LivePage<DebateArgumentPayload>> {
  const response = await api.get<Envelope<DebateArgumentPayload[]>>(`/debates/${id}/updates`, {
    params: { after },
  })

  return {
    items: response.data.data,
    latest: response.data.meta?.latest ?? after,
    more: response.data.meta?.more === true,
  }
}

export function debateCursor(post: DebatePost): number {
  let cursor = 0

  for (const comment of post.comments) {
    cursor = Math.max(cursor, numericId(comment.id))
    for (const reply of comment.replies) {
      cursor = Math.max(cursor, numericId(reply.id))
    }
  }

  return cursor
}

export function debateFeedCursor(posts: DebatePost[]): number {
  return posts.reduce((cursor, post) => Math.max(cursor, numericId(post.id)), 0)
}

export function commentsCursor(posts: DebatePost[]): number {
  return posts.reduce((cursor, post) => Math.max(cursor, debateCursor(post)), 0)
}

export function applyFeedArguments(posts: DebatePost[], rows: DebateArgumentPayload[]): number {
  let cursor = 0

  for (const row of rows) {
    const post = posts.find((item) => item.id === String(row.topic_id))
    if (post) {
      const applied = applyArgumentUpdates(post, [row])
      if (applied === 0 && !commentExists(post, row.id)) {
        return cursor
      }
    }

    cursor = row.id
  }

  return cursor
}

export function applyArgumentUpdates(post: DebatePost, rows: DebateArgumentPayload[]): number {
  let cursor = 0

  for (const row of rows) {
    const id = String(row.id)
    if (typeof row.parent_id === 'number') {
      const parent = post.comments.find((comment) => comment.id === String(row.parent_id))
      if (!parent) {
        return cursor
      }

      if (!parent.replies.some((reply) => reply.id === id)) {
        parent.replies.push(toComment(row))
      }
    } else if (!post.comments.some((comment) => comment.id === id)) {
      post.comments.push(toComment(row))
    }

    cursor = row.id
  }

  return cursor
}

export async function createArgument(topicId: string, body: string, parentId?: string): Promise<DebateComment> {
  const response = await api.post<Envelope<DebateArgumentPayload>>(`/debates/${topicId}/arguments`, {
    body,
    ...(parentId ? { parent_id: Number(parentId) } : {}),
  })

  return toComment(response.data.data)
}

export async function toggleDebateReaction(topicId: string): Promise<{ likes: number; liked: boolean }> {
  const response = await api.post<Envelope<{ likes: number; liked: boolean }>>(`/debates/${topicId}/reactions`)

  return response.data.data
}

export async function toggleArgumentReaction(argumentId: string): Promise<{ likes: number; liked: boolean }> {
  const response = await api.post<Envelope<{ likes: number; liked: boolean }>>(`/arguments/${argumentId}/reactions`)

  return response.data.data
}

export async function castArgumentVote(
  argumentId: string,
  stance: 'favor' | 'contra',
): Promise<{ favor: number; contra: number; stance: 'favor' | 'contra' | null }> {
  const response = await api.post<Envelope<{ favor: number; contra: number; stance: 'favor' | 'contra' | null }>>(
    `/arguments/${argumentId}/votes`,
    { stance },
  )

  return response.data.data
}

export async function shareDebate(topicId: string): Promise<number> {
  const response = await api.post<Envelope<{ shares: number }>>(`/debates/${topicId}/shares`)

  return response.data.data.shares
}

function toPost(topic: DebatePayload): DebatePost {
  const nick = topic.author.nick ?? 'participante'

  return {
    id: String(topic.id),
    author: presentName(nick),
    role: topic.context ?? 'Participante',
    avatar: mediaUrl(topic.author.avatar) || avatarFor(nick),
    time: relativeTime(topic.created_at),
    body: topic.body,
    image: mediaUrl(topic.image),
    kind: topic.kind === 'video' ? 'video' : 'image',
    likes: topic.likes,
    shares: topic.shares,
    liked: topic.liked,
    closed: topic.closed === true,
    featured: topic.featured === true,
    comments: topic.arguments.map(toComment),
  }
}

function toComment(argument: DebateArgumentPayload): DebateComment {
  const nick = argument.author.nick ?? 'participante'

  return {
    id: String(argument.id),
    author: presentName(nick),
    avatar: mediaUrl(argument.author.avatar) || avatarFor(nick),
    time: relativeTime(argument.created_at),
    body: argument.body,
    likes: argument.likes,
    liked: argument.liked,
    favor: argument.favor,
    contra: argument.contra,
    stance: argument.stance,
    replies: argument.replies.map(toComment),
  }
}

function commentExists(post: DebatePost, id: number): boolean {
  const key = String(id)

  return post.comments.some((comment) => comment.id === key || comment.replies.some((reply) => reply.id === key))
}

function numericId(value: string): number {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : 0
}

function presentName(nick: string): string {
  const known = knownNames[nick]
  if (known) {
    return known
  }

  return nick
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function avatarFor(nick: string): string {
  return knownAvatars[nick] ?? photo('photo-1535713875002-d1d0cf377fde', 160)
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
