<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { firstApiMessage, readApiErrors } from '../api/auth'
import { searchPublic, type SearchResults } from '../api/search'

const route = useRoute()
const router = useRouter()
const term = ref('')
const loading = ref(false)
const error = ref('')
const results = ref<SearchResults | null>(null)

function queryTerm(): string {
  return typeof route.query.q === 'string' ? route.query.q.trim() : ''
}

async function load(): Promise<void> {
  const q = queryTerm()
  term.value = q
  results.value = null
  error.value = ''

  if (q.length < 2) {
    return
  }

  loading.value = true
  try {
    results.value = await searchPublic(q)
  } catch (cause) {
    error.value = axios.isAxiosError(cause) ? firstApiMessage(readApiErrors(cause)) : 'No se pudo buscar.'
  } finally {
    loading.value = false
  }
}

function submit(): void {
  const q = term.value.trim()
  if (q.length < 2) {
    error.value = 'Escribe al menos 2 caracteres.'
    results.value = null
    return
  }

  void router.push({ name: 'search', query: { q } })
}

watch(() => route.query.q, () => {
  void load()
}, { immediate: true })
</script>

<template>
  <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-4 sm:px-4">
    <h1 class="text-2xl font-semibold text-slate-900">Buscar</h1>
    <form class="mt-4" role="search" @submit.prevent="submit">
      <label class="text-sm font-medium" for="buscar-resultados">Qué quieres encontrar</label>
      <input
        id="buscar-resultados"
        v-model="term"
        type="search"
        maxlength="80"
        class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
      />
    </form>

    <p v-if="loading" class="mt-4 text-sm text-slate-600" role="status">Buscando…</p>
    <p v-else-if="error" class="mt-4 text-sm text-red-700" role="alert">{{ error }}</p>
    <div v-else-if="results" class="mt-6 space-y-6">
      <p
        v-if="results.debates.length + results.news.length + results.polls.length === 0"
        class="text-sm text-slate-600"
        role="status"
      >
        No hay resultados.
      </p>

      <section v-if="results.debates.length > 0">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Debates</h2>
        <ul class="mt-2 space-y-2">
          <li v-for="item in results.debates" :key="item.id" class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
            <RouterLink :to="`/debates/${item.id}`" class="font-semibold text-slate-900 hover:text-brand">
              {{ item.body }}
            </RouterLink>
            <p v-if="item.author_nick" class="mt-1 text-xs text-slate-500">{{ item.author_nick }}</p>
          </li>
        </ul>
      </section>

      <section v-if="results.news.length > 0">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Noticias</h2>
        <ul class="mt-2 space-y-2">
          <li v-for="item in results.news" :key="item.id" class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
            <RouterLink :to="`/noticias/${item.id}`" class="font-semibold text-slate-900 hover:text-brand">
              {{ item.title }}
            </RouterLink>
            <p class="mt-1 text-xs text-slate-500">{{ item.source }}</p>
          </li>
        </ul>
      </section>

      <section v-if="results.polls.length > 0">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Votaciones</h2>
        <ul class="mt-2 space-y-2">
          <li v-for="item in results.polls" :key="item.id" class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
            <RouterLink to="/votaciones" class="font-semibold text-slate-900 hover:text-brand">
              {{ item.title }}
            </RouterLink>
            <p class="mt-1 text-xs text-slate-500">{{ item.place }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
