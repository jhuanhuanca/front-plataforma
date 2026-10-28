import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  profileConnections,
  profileExperience,
  profileFriends,
  type AccountTab,
  type ProfileExperience,
} from '../data/profile'

export const useAccountStore = defineStore('account', () => {
  const name = ref('Mateo Ríos')
  const tab = ref<AccountTab>('conexiones')
  const connections = ref(structuredClone(profileConnections))
  const friends = ref(structuredClone(profileFriends))
  const experiences = ref<ProfileExperience[]>(structuredClone(profileExperience))
  const following = ref<string[]>([])
  const showAllConnections = ref(false)
  const showAllPhotos = ref(false)
  const notice = ref('')
  const chatNick = ref('')
  const chatRequest = ref(0)
  const experienceDraft = ref('')
  const addingExperience = ref(false)

  const visibleConnections = computed(() => {
    if (showAllConnections.value) {
      return connections.value
    }

    return connections.value.slice(0, 4)
  })

  function saveName(next: string): void {
    const text = next.trim()
    if (text.length < 3) {
      notice.value = 'El nombre visible necesita al menos 3 caracteres.'
      return
    }

    name.value = text
    notice.value = 'Nombre visible actualizado en este navegador.'
  }

  function removeConnection(id: string): void {
    connections.value = connections.value.filter((person) => person.id !== id)
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
      detail: 'Añadido ahora · Participación local.',
      tone: 'emerald',
    })
    experienceDraft.value = ''
    addingExperience.value = false
    notice.value = 'Experiencia añadida en este navegador.'
  }

  return {
    name,
    tab,
    connections,
    friends,
    experiences,
    following,
    showAllConnections,
    showAllPhotos,
    notice,
    chatNick,
    chatRequest,
    experienceDraft,
    addingExperience,
    visibleConnections,
    saveName,
    removeConnection,
    message,
    toggleFollow,
    addExperience,
  }
})
