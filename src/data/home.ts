export type HomeCategory =
  | 'para-ti'
  | 'politica'
  | 'tendencias'
  | 'noticias'
  | 'territorio'
  | 'economia'

export interface Topic {
  id: string
  category: Exclude<HomeCategory, 'para-ti' | 'tendencias'>
  title: string
  image: string
  likes: number
  comments: number
  shares: number
  liked: boolean
  kind: 'image' | 'video' | 'text'
  duration?: string
  href?: string
  source?: 'debate' | 'news' | 'poll'
}

export const homeTabs: { id: HomeCategory; label: string }[] = [
  { id: 'para-ti', label: 'Para ti' },
  { id: 'politica', label: 'Política' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'territorio', label: 'Territorio' },
  { id: 'economia', label: 'Economía' },
]
