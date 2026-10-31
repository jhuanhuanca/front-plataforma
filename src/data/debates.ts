export interface DebateComment {
  id: string
  author: string
  avatar: string
  time: string
  body: string
  likes: number
  liked: boolean
  favor: number
  contra: number
  stance: 'favor' | 'contra' | null
  replies: DebateComment[]
}

export interface DebatePost {
  id: string
  author: string
  role: string
  category?: 'politica' | 'territorio' | 'economia' | null
  avatar: string
  time: string
  body: string
  image: string
  kind: 'image' | 'video'
  likes: number
  shares: number
  liked: boolean
  closed?: boolean
  featured?: boolean
  comments: DebateComment[]
}
