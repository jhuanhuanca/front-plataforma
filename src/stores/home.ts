import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { firstApiMessage, readApiErrors } from '../api/auth'
import { fetchDebates, fetchNewerDebates, toggleDebateReaction } from '../api/debates'
import { fetchMetrics, type PublicMetrics } from '../api/metrics'
import { fetchNews } from '../api/news'
import { fetchPolls } from '../api/polls'
import { topics, type HomeCategory, type Topic } from '../data/home'
import { homeCards, placeLiveDebates } from '../lib/homeFeed'

export const useHomeStore = defineStore('home', () => {
  const cards = ref<Topic[]>([])
  const query = ref('')
  const category = ref<HomeCategory>('para-ti')
  const previewId = ref<string | null>(null)
  const remote = ref(false)
  const loading = ref(false)
  const loadError = ref('')
  const metrics = ref<PublicMetrics | null>(null)

  const visible = computed(() => {
    const text = query.value.trim().toLowerCase()

    return cards.value.filter((card) => {
      const matchesCategory = category.value === 'para-ti'
        || card.category === category.value
        || (category.value === 'tendencias' && card.source === 'debate' && card.likes >= 40)
      const matchesQuery = text.length === 0 || card.title.toLowerCase().includes(text)
      return matchesCategory && matchesQuery
    })
  })

  async function load(): Promise<void> {
    loading.value = true
    loadError.value = ''

    const [debates, news, polls, totals] = await Promise.allSettled([
      fetchDebates(),
      fetchNews(),
      fetchPolls(),
      fetchMetrics(),
    ])
    metrics.value = totals.status === 'fulfilled' ? totals.value : null
    const loaded = homeCards(
      debates.status === 'fulfilled' ? debates.value : [],
      news.status === 'fulfilled' ? news.value : [],
      polls.status === 'fulfilled' ? polls.value : [],
    )

    if (loaded.length === 0) {
      cards.value = topics.map((topic) => ({ ...topic }))
      remote.value = false
      loadError.value = 'No se pudo cargar el inicio. Se muestran los temas de ejemplo.'
    } else {
      cards.value = loaded
      remote.value = true
      if (debates.status === 'rejected' || news.status === 'rejected' || polls.status === 'rejected') {
        loadError.value = 'Una parte del inicio no cargó. Se muestra lo que sí está disponible.'
      }
    }

    loading.value = false
  }

  async function toggleLike(id: string): Promise<string> {
    const card = cards.value.find((item) => item.id === id)
    if (!card || card.source === 'news' || card.source === 'poll') {
      return ''
    }

    if (!remote.value || card.source !== 'debate') {
      card.liked = !card.liked
      card.likes += card.liked ? 1 : -1
      return ''
    }

    if (localStorage.getItem('auth_token') === null) {
      return 'Entra para apoyar un argumento.'
    }

    try {
      const state = await toggleDebateReaction(card.id)
      card.likes = state.likes
      card.liked = state.liked
      return ''
    } catch (cause) {
      return likeError(cause)
    }
  }

  function togglePreview(id: string): void {
    previewId.value = previewId.value === id ? null : id
  }

  let feedTimer = 0
  let feedBusy = false
  let feedPauseUntil = 0

  function followFeed(): void {
    stopFeed()
    if (!remote.value) {
      return
    }

    feedTimer = window.setInterval(() => {
      void pullFeed()
    }, 2000)
    document.addEventListener('visibilitychange', onFeedVisible)
  }

  function stopFeed(): void {
    window.clearInterval(feedTimer)
    feedTimer = 0
    document.removeEventListener('visibilitychange', onFeedVisible)
  }

  function onFeedVisible(): void {
    if (!document.hidden) {
      void pullFeed()
    }
  }

  async function pullFeed(): Promise<void> {
    if (feedBusy || !remote.value || document.hidden || Date.now() < feedPauseUntil) {
      return
    }

    const known = cards.value
      .filter((card) => card.source === 'debate')
      .map((card) => Number(card.id))
      .filter((id) => Number.isInteger(id))
    let after = known.reduce((cursor, id) => Math.max(cursor, id), 0)

    feedBusy = true
    try {
      for (let round = 0; round < 3; round += 1) {
        const page = await fetchNewerDebates(after)
        placeLiveDebates(cards.value, page.items)
        if (!page.more || page.latest <= after) {
          break
        }

        after = page.latest
      }
    } catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 429) {
        feedPauseUntil = Date.now() + 15000
      }
    } finally {
      feedBusy = false
    }
  }

  return {
    cards,
    query,
    category,
    previewId,
    visible,
    remote,
    loading,
    loadError,
    metrics,
    load,
    toggleLike,
    togglePreview,
    followFeed,
    stopFeed,
  }
})

function likeError(cause: unknown): string {
  if (!axios.isAxiosError(cause) || !cause.response) {
    return 'No se pudo conectar con el servidor.'
  }

  return firstApiMessage(readApiErrors(cause))
}
