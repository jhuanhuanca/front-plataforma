<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ModuleFrame from '../components/news/ModuleFrame.vue'
import NewsCard from '../components/news/NewsCard.vue'
import { useNewsStore } from '../stores/news'

const news = useNewsStore()
const source = ref('')

const sources = computed(() => [...new Set(news.items.map((item) => item.source))])
const visible = computed(() => {
  if (source.value.length === 0) {
    return news.items
  }

  return news.items.filter((item) => item.source === source.value)
})

onMounted(() => {
  void news.load()
})

function chooseSource(next: string): void {
  source.value = source.value === next ? '' : next
}
</script>

<template>
  <ModuleFrame>
    <header class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <h1 class="text-lg font-semibold text-slate-900">Noticias</h1>
      <p class="mt-1 text-sm text-slate-600">Lo que se está discutiendo, con el debate al lado cuando existe.</p>
    </header>

    <p v-if="news.loadError" class="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" role="status">
      {{ news.loadError }}
    </p>

    <div v-if="sources.length > 0" class="min-w-0 overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <ul class="flex max-w-full gap-3 overflow-x-auto pb-1">
        <li class="w-24 shrink-0 text-center">
          <button
            type="button"
            class="grid h-16 w-full place-items-center rounded-xl text-sm font-medium"
            :class="source === '' ? 'bg-brand text-white' : 'bg-canvas text-slate-700'"
            :aria-pressed="source === ''"
            @click="source = ''"
          >
            Todas
          </button>
        </li>
        <li v-for="name in sources" :key="name" class="w-28 shrink-0 text-center">
          <button
            type="button"
            class="flex h-16 w-full items-center justify-center rounded-xl px-2 text-xs font-medium"
            :class="source === name ? 'bg-brand text-white' : 'bg-canvas text-slate-700'"
            :aria-pressed="source === name"
            @click="chooseSource(name)"
          >
            {{ name }}
          </button>
        </li>
      </ul>
    </div>

    <p v-if="news.loading && news.items.length === 0" class="rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
      Cargando noticias...
    </p>

    <p v-else-if="visible.length === 0" class="rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
      No hay noticias de esa fuente.
    </p>

    <NewsCard v-for="item in visible" :key="item.id" :item="item" />
  </ModuleFrame>
</template>
