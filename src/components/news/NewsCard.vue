<script setup lang="ts">
import { ref } from 'vue'
import type { NewsItem } from '../../api/news'
import AppIcon from '../ui/AppIcon.vue'
import ReportControl from '../moderation/ReportControl.vue'

withDefaults(defineProps<{
  item: NewsItem
  heading?: 'h1' | 'h2'
}>(), {
  heading: 'h2',
})

const notice = ref('')

async function share(id: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/noticias/${id}`)
    notice.value = 'Enlace de la noticia copiado.'
  } catch {
    notice.value = 'No se pudo copiar el enlace en este navegador.'
  }
}
</script>

<template>
  <article class="min-w-0 max-w-full overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
    <header class="flex items-start gap-3">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
        <AppIcon name="news" class="h-5 w-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-900">{{ item.source }}</p>
        <p class="text-xs text-slate-500">{{ item.time }}</p>
      </div>
    </header>

    <component
      :is="heading"
      class="mt-3 text-[15px] font-semibold leading-snug text-slate-900"
      :class="heading === 'h1' ? 'text-xl' : ''"
    >
      <RouterLink :to="`/noticias/${item.id}`" class="hover:text-brand">{{ item.title }}</RouterLink>
    </component>
    <p v-if="item.summary" class="mt-2 text-[15px] leading-relaxed text-slate-800">{{ item.summary }}</p>

    <div class="mt-3 flex min-w-0 flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-sm">
      <div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <RouterLink :to="`/noticias/${item.id}`" class="inline-flex items-center gap-1 font-medium text-brand">
          Leer
        </RouterLink>
        <RouterLink
          v-if="item.debateId"
          :to="`/debates/${item.debateId}`"
          class="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-brand"
        >
          <AppIcon name="comment" class="h-4 w-4" />
          Abrir el debate
        </RouterLink>
        <ReportControl target-type="news" :target-id="item.id" />
      </div>
      <button type="button" class="inline-flex items-center gap-1 hover:text-slate-900" @click="share(item.id)">
        <AppIcon name="share" class="h-4 w-4" />
        Compartir
      </button>
    </div>
    <p v-if="notice" class="mt-2 text-sm text-slate-600" role="status">{{ notice }}</p>
  </article>
</template>
