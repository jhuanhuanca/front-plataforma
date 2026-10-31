import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchPeople, type RegisteredPerson } from '../api/people'
import type { AccountTab } from '../data/profile'

export interface AccountExperience {
  id: string
  place: string
  detail: string
  tone: 'emerald' | 'rose' | 'amber'
}

export const useAccountStore = defineStore('account', () => {
  const tab = ref<AccountTab>('conexiones')
  const people = ref<RegisteredPerson[]>([])
  const hiddenIds = ref<number[]>([])
  const peopleQuery = ref('')
  const peopleLoading = ref(false)
  const peopleError = ref('')
  const showAllConnections = ref(false)
  const showAllPhotos = ref(false)
  const notice = ref('')
  const chatNick = ref('')
  const chatRequest = ref(0)
  const experiences = ref<AccountExperience[]>([])
  const experienceDraft = ref('')
  const addingExperience = ref(false)
  const following = ref<string[]>([])

  const listedPeople = computed(() => people.value.filter((person) => !hiddenIds.value.includes(person.id)))

  const visiblePeople = computed(() => {
    if (showAllConnections.value) {
      return listedPeople.value
    }

    return listedPeople.value.slice(0, 4)
  })

  async function loadPeople(): Promise<void> {
    if (localStorage.getItem('auth_token') === null) {
      people.value = []
      peopleError.value = ''
      return
    }

    peopleLoading.value = true
    peopleError.value = ''

    try {
      people.value = await fetchPeople(peopleQuery.value)
    } catch {
      people.value = []
      peopleError.value = 'No se pudo cargar a las personas registradas.'
    } finally {
      peopleLoading.value = false
    }
  }

  function removeConnection(id: number): void {
    if (!hiddenIds.value.includes(id)) {
      hiddenIds.value.push(id)
    }
    notice.value = 'Conexión quitada de esta lista.'
  }

  function message(nick: string): void {
    if (localStorage.getItem('auth_token') === null) {
      notice.value = 'Entra para conversar con esa persona.'
      return
    }

    chatNick.value = nick
    chatRequest.value += 1
    notice.value = ''
  }

  function toggleFollow(id: string): void {
    if (following.value.includes(id)) {
      following.value = following.value.filter((item) => item !== id)
      return
    }

    following.value.push(id)
  }

  function addExperience(): void {
    const text = experienceDraft.value.trim()
    if (text.length === 0) {
      notice.value = 'Escribe la mesa o el espacio antes de añadirlo.'
      return
    }

    experiences.value.unshift({
      id: `local-${Date.now()}`,
      place: text,
      detail: '',
      tone: 'emerald',
    })
    experienceDraft.value = ''
    addingExperience.value = false
    notice.value = ''
  }

  return {
    tab,
    people,
    peopleQuery,
    peopleLoading,
    peopleError,
    showAllConnections,
    showAllPhotos,
    notice,
    chatNick,
    chatRequest,
    experiences,
    experienceDraft,
    addingExperience,
    following,
    listedPeople,
    visiblePeople,
    loadPeople,
    removeConnection,
    message,
    toggleFollow,
    addExperience,
  }
})
