<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ModuleFrame from '../components/news/ModuleFrame.vue'
import NewsCard from '../components/news/NewsCard.vue'
import { useNewsStore } from '../stores/news'

const route = useRoute()
const news = useNewsStore()

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string' && id.length > 0) {
      void news.open(id)
    }
  },
  { immediate: true },
)
</script>

<template>
  <ModuleFrame>
    <RouterLink to="/noticias" class="inline-block text-sm font-medium text-brand">Volver a las noticias</RouterLink>

    <p v-if="news.detailLoading && !news.opened" class="rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
      Cargando la noticia...
    </p>

    <p v-else-if="news.detailError" class="rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
      {{ news.detailError }}
    </p>

    <NewsCard v-else-if="news.opened" :item="news.opened" heading="h1" />
  </ModuleFrame>
</template>
