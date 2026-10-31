<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { homeTabs } from '../data/home'
import HeroStage from '../components/layout/HeroStage.vue'
import TopicCard from '../components/news/TopicCard.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { useHomeStore } from '../stores/home'

const home = useHomeStore()
const router = useRouter()
const notice = ref('')
const searchError = ref('')

function submitSearch(): void {
  const q = home.query.trim()
  if (q.length < 2) {
    searchError.value = 'Escribe al menos 2 caracteres.'
    return
  }

  searchError.value = ''
  void router.push({ name: 'search', query: { q } })
}

onMounted(() => {
  void home.load().then(() => home.followFeed())
})

onUnmounted(() => {
  home.stopFeed()
})

async function like(id: string): Promise<void> {
  notice.value = await home.toggleLike(id)
}
</script>

<template>
  <div>
    <section class="relative isolate min-h-[300px] overflow-hidden bg-brand sm:min-h-[340px]">
      <HeroStage v-slot="{ announcement }" place="home">
      <div class="relative mx-auto flex min-h-[300px] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center text-white sm:min-h-[340px] sm:py-16">
        <h1 class="text-3xl font-bold tracking-tight sm:text-5xl">
          Lo que pasa. Lo que piensas.
        </h1>
        <span class="mt-3 block h-1 w-28 rounded-full bg-accent" aria-hidden="true"></span>
        <p class="mt-3 max-w-xl text-sm font-medium text-white/95 sm:text-base">
          Conversaciones que construyen mejores decisiones.
        </p>
        <p v-if="announcement" class="mt-3 max-w-xl text-sm font-semibold text-white">{{ announcement }}</p>
        <form class="mt-6 w-full max-w-xl" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="buscar-inicio">Buscar temas</label>
          <div class="flex items-center rounded-md bg-white px-3 shadow-lg">
            <AppIcon name="search" class="h-5 w-5 text-slate-400" />
            <input
              id="buscar-inicio"
              v-model="home.query"
              type="search"
              placeholder="Buscar..."
              maxlength="80"
              class="h-12 w-full bg-transparent px-2 text-slate-800 outline-none"
            />
          </div>
          <p v-if="searchError" class="mt-2 text-sm text-white" role="alert">{{ searchError }}</p>
        </form>
      </div>
      </HeroStage>
    </section>

    <div class="mx-auto max-w-[1100px] px-3 py-5 sm:px-4 sm:py-8">
      <div class="flex justify-center" role="tablist" aria-label="Temas">
        <div class="flex max-w-sm flex-wrap justify-center gap-x-1 gap-y-1 sm:max-w-none sm:flex-nowrap">
          <button
            v-for="tab in homeTabs"
            :id="`tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            class="rounded-full px-3 py-2 text-sm font-medium sm:px-4"
            :class="home.category === tab.id ? 'bg-white text-brand shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            :aria-selected="home.category === tab.id"
            @click="home.category = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <ul v-if="home.metrics" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Actividad pública">
        <li class="rounded-xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200/80">
          <p class="text-2xl font-semibold text-brand">{{ home.metrics.debates }}</p>
          <p class="text-xs text-slate-500">Debates</p>
        </li>
        <li class="rounded-xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200/80">
          <p class="text-2xl font-semibold text-brand">{{ home.metrics.arguments }}</p>
          <p class="text-xs text-slate-500">Argumentos</p>
        </li>
        <li class="rounded-xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200/80">
          <p class="text-2xl font-semibold text-brand">{{ home.metrics.votes }}</p>
          <p class="text-xs text-slate-500">Votos</p>
        </li>
        <li class="rounded-xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200/80">
          <p class="text-2xl font-semibold text-brand">{{ home.metrics.news }}</p>
          <p class="text-xs text-slate-500">Noticias</p>
        </li>
        <li class="rounded-xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-slate-200/80">
          <p class="text-2xl font-semibold text-brand">{{ home.metrics.voices }}</p>
          <p class="text-xs text-slate-500">Voces</p>
        </li>
      </ul>

      <p v-if="home.loadError" class="mt-6 text-center text-sm text-slate-600" role="status">{{ home.loadError }}</p>
      <p v-if="notice" class="mt-4 text-center text-sm text-slate-700" role="status">{{ notice }}</p>

      <p v-if="home.loading && home.cards.length === 0" class="mt-10 text-center text-slate-600" role="status">
        Cargando el inicio...
      </p>

      <p v-else-if="home.visible.length === 0" class="mt-10 text-center text-slate-600" role="status">
        No hay temas con ese criterio. Prueba otra palabra o vuelve a Para ti.
      </p>

      <div v-else class="mt-5 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <TopicCard
          v-for="topic in home.visible"
          :key="topic.id"
          :topic="topic"
          :preview="home.previewId === topic.id"
          @like="like(topic.id)"
          @preview="home.togglePreview(topic.id)"
        />
      </div>
    </div>
  </div>
</template>
