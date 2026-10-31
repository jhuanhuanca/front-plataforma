export type PollCategory =
  | 'todas'
  | 'territorio'
  | 'economia'
  | 'cultura'
  | 'movilidad'
  | 'cuidados'

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface Poll {
  id: string
  title: string
  image: string
  badge: string
  place: string
  category: Exclude<PollCategory, 'todas'>
  options: PollOption[]
  votedOptionId: string | null
}

export const pollCategories: { id: Exclude<PollCategory, 'todas'>; label: string }[] = [
  { id: 'territorio', label: 'Territorio y barrio' },
  { id: 'economia', label: 'Economía local' },
  { id: 'cultura', label: 'Cultura y fiestas' },
  { id: 'movilidad', label: 'Movilidad' },
  { id: 'cuidados', label: 'Cuidados' },
]
