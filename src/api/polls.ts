import { api } from './client'
import type { Poll, PollCategory } from '../data/polls'

interface PollOptionPayload {
  id: number
  label: string
  votes: number
}

interface PollPayload {
  id: number
  title: string
  image: string | null
  badge: string
  place: string
  category: string
  voted_option_id: number | null
  options: PollOptionPayload[]
}

interface Envelope<T> {
  data: T
}

const categories = new Set(['territorio', 'economia', 'cultura', 'movilidad', 'cuidados'])

export async function fetchPolls(): Promise<Poll[]> {
  const response = await api.get<Envelope<PollPayload[]>>('/polls')

  return response.data.data.map(toPoll)
}

export async function castPollVote(pollId: string, optionId: string): Promise<Poll> {
  const response = await api.post<Envelope<PollPayload>>(`/polls/${pollId}/votes`, {
    option_id: Number(optionId),
  })

  return toPoll(response.data.data)
}

function toPoll(poll: PollPayload): Poll {
  return {
    id: String(poll.id),
    title: poll.title,
    image: poll.image ?? '',
    badge: poll.badge,
    place: poll.place,
    category: categoryOf(poll.category),
    votedOptionId: poll.voted_option_id === null ? null : String(poll.voted_option_id),
    options: poll.options.map((option) => ({
      id: String(option.id),
      label: option.label,
      votes: option.votes,
    })),
  }
}

function categoryOf(value: string): Exclude<PollCategory, 'todas'> {
  if (categories.has(value)) {
    return value as Exclude<PollCategory, 'todas'>
  }

  return 'territorio'
}
