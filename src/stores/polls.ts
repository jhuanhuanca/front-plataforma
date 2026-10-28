import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { firstApiMessage, readApiErrors } from '../api/auth'
import { castPollVote, fetchPolls } from '../api/polls'
import { polls, type Poll, type PollCategory } from '../data/polls'

interface ActionResult {
  ok: boolean
  message: string
}

export const usePollStore = defineStore('polls', () => {
  const items = ref<Poll[]>([])
  const topic = ref('')
  const place = ref('')
  const category = ref<PollCategory>('todas')
  const appliedTopic = ref('')
  const appliedPlace = ref('')
  const remote = ref(false)
  const loading = ref(false)
  const loadError = ref('')

  const visible = computed(() => {
    const topicText = appliedTopic.value.trim().toLowerCase()
    const placeText = appliedPlace.value.trim().toLowerCase()

    return items.value.filter((poll) => {
      const matchesCategory = category.value === 'todas' || poll.category === category.value
      const matchesTopic = topicText.length === 0 || poll.title.toLowerCase().includes(topicText)
      const matchesPlace = placeText.length === 0 || poll.place.toLowerCase().includes(placeText)
      return matchesCategory && matchesTopic && matchesPlace
    })
  })

  async function load(): Promise<void> {
    loading.value = true
    loadError.value = ''

    try {
      items.value = await fetchPolls()
      remote.value = true
    } catch {
      items.value = structuredClone(polls)
      remote.value = false
      loadError.value = 'No se pudieron cargar las votaciones. Se muestran las de ejemplo.'
    } finally {
      loading.value = false
    }
  }

  function search(): void {
    appliedTopic.value = topic.value
    appliedPlace.value = place.value
  }

  async function vote(pollId: string, optionId: string): Promise<ActionResult> {
    const poll = items.value.find((item) => item.id === pollId)
    if (!poll || poll.votedOptionId) {
      return { ok: false, message: '' }
    }

    const option = poll.options.find((item) => item.id === optionId)
    if (!option) {
      return { ok: false, message: 'Esa opción no está en la votación.' }
    }

    if (!remote.value) {
      option.votes += 1
      poll.votedOptionId = optionId
      return { ok: true, message: 'Voto registrado en este navegador.' }
    }

    if (localStorage.getItem('auth_token') === null) {
      return { ok: false, message: 'Entra para votar.' }
    }

    try {
      const updated = await castPollVote(pollId, optionId)
      const index = items.value.findIndex((item) => item.id === updated.id)
      if (index >= 0) {
        items.value[index] = updated
      }

      return { ok: true, message: 'Voto registrado.' }
    } catch (cause) {
      return { ok: false, message: voteError(cause) }
    }
  }

  function total(poll: Poll): number {
    return poll.options.reduce((sum, option) => sum + option.votes, 0)
  }

  return { items, topic, place, category, visible, remote, loading, loadError, load, search, vote, total }
})

function voteError(cause: unknown): string {
  if (!axios.isAxiosError(cause) || !cause.response) {
    return 'No se pudo conectar con el servidor.'
  }

  return firstApiMessage(readApiErrors(cause))
}
