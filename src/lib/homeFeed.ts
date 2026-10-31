import type { NewsItem } from '../api/news'
import type { DebatePost } from '../data/debates'
import type { Topic } from '../data/home'
import type { Poll } from '../data/polls'

export function placeLiveDebates(cards: Topic[], posts: DebatePost[]): void {
  for (const post of posts) {
    const card = debateCard(post)
    if (cards.some((item) => item.id === card.id)) {
      continue
    }

    cards.unshift(card)
  }
}

export function homeCards(debates: DebatePost[], news: NewsItem[], polls: Poll[]): Topic[] {
  return [
    ...debates.map(debateCard),
    ...news.map(newsCard),
    ...polls.map(pollCard),
  ]
}

function debateCard(debate: DebatePost): Topic {
  return {
    id: debate.id,
    category: debateCategory(debate.role, debate.category),
    title: debate.body,
    image: debate.image,
    likes: debate.likes,
    comments: debate.comments.length,
    shares: debate.shares,
    liked: debate.liked,
    kind: debate.image.length === 0 ? 'text' : debate.kind,
    href: `/debates/${debate.id}`,
    source: 'debate',
  }
}

function newsCard(item: NewsItem): Topic {
  return {
    id: `noticia-${item.id}`,
    category: 'noticias',
    title: item.title,
    image: '',
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    kind: 'text',
    href: `/noticias/${item.id}`,
    source: 'news',
  }
}

function pollCard(poll: Poll): Topic {
  return {
    id: `votacion-${poll.id}`,
    category: pollCategory(poll.category),
    title: poll.title,
    image: poll.image,
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    kind: poll.image.length === 0 ? 'text' : 'image',
    href: '/votaciones',
    source: 'poll',
  }
}

function debateCategory(role: string, category?: DebatePost['category']): Topic['category'] {
  if (category === 'politica' || category === 'territorio' || category === 'economia') {
    return category
  }

  const text = role.toLowerCase()
  if (text.includes('movilidad') || text.includes('territorio')) {
    return 'territorio'
  }
  if (text.includes('presupuesto') || text.includes('econom')) {
    return 'economia'
  }

  return 'politica'
}

function pollCategory(category: Poll['category']): Topic['category'] {
  if (category === 'economia') {
    return 'economia'
  }
  if (category === 'territorio' || category === 'movilidad' || category === 'cuidados') {
    return 'territorio'
  }

  return 'politica'
}
