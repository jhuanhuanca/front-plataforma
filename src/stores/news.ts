import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { fetchNews, fetchNewsItem, type NewsItem } from '../api/news'

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const remote = ref(false)
  const openedId = ref('')
  const detailLoading = ref(false)
  const detailError = ref('')

  const opened = computed(() => items.value.find((item) => item.id === openedId.value) ?? null)

  async function load(): Promise<void> {
    loading.value = true
    loadError.value = ''

    try {
      items.value = await fetchNews()
      remote.value = true
    } catch {
      items.value = []
      remote.value = false
      loadError.value = 'No se pudieron cargar las noticias.'
    } finally {
      loading.value = false
    }
  }

  async function open(id: string): Promise<void> {
    openedId.value = id
    detailLoading.value = true
    detailError.value = ''

    try {
      const item = await fetchNewsItem(id)
      remote.value = true
      const index = items.value.findIndex((entry) => entry.id === item.id)
      if (index >= 0) {
        items.value[index] = item
      } else {
        items.value.unshift(item)
      }
    } catch (cause) {
      const cached = items.value.some((entry) => entry.id === id)
      if (!cached) {
        detailError.value = axios.isAxiosError(cause) && cause.response?.status === 404
          ? 'Esta noticia no está disponible.'
          : 'No se pudo abrir la noticia.'
      }
    } finally {
      detailLoading.value = false
    }
  }

  return {
    items,
    loading,
    loadError,
    remote,
    opened,
    detailLoading,
    detailError,
    load,
    open,
  }
})
