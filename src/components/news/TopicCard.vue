<script setup lang="ts">
import type { Topic } from '../../data/home'
import AppIcon from '../ui/AppIcon.vue'

defineProps<{
  topic: Topic
  preview: boolean
}>()

const emit = defineEmits<{
  like: []
  preview: []
}>()
</script>

<template>
  <article class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
    <div v-if="topic.kind !== 'text'" class="relative h-48 bg-slate-200 sm:h-44">
      <video
        v-if="topic.kind === 'video' && (topic.image.startsWith('blob:') || /\.(mp4|webm)(\?|#|$)/i.test(topic.image))"
        :src="topic.image"
        controls
        preload="metadata"
        class="h-full w-full object-cover"
      />
      <img v-else :src="topic.image" alt="" class="h-full w-full object-cover" loading="lazy" />
      <template v-if="topic.kind === 'video' && !topic.image.startsWith('blob:') && !/\.(mp4|webm)(\?|#|$)/i.test(topic.image)">
        <button
          type="button"
          class="absolute inset-0 grid place-items-center"
          :aria-label="preview ? 'Cerrar vista previa' : 'Reproducir vista previa'"
          :aria-pressed="preview"
          @click="emit('preview')"
        >
          <span class="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-brand shadow">
            <AppIcon name="play" class="h-7 w-7" />
          </span>
        </button>
        <span class="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
          {{ topic.duration }}
        </span>
      </template>
      <p v-if="preview" class="absolute inset-x-3 bottom-3 rounded-md bg-white/95 px-3 py-2 text-sm text-slate-700">
        Vista previa. El video se publicará cuando la fuente esté verificada.
      </p>
    </div>
    <div class="space-y-4 p-4">
      <h2 class="text-[15px] leading-snug text-slate-800">
        <RouterLink v-if="topic.href" :to="topic.href" class="hover:text-brand">{{ topic.title }}</RouterLink>
        <template v-else>{{ topic.title }}</template>
      </h2>
      <div v-if="topic.source !== 'news' && topic.source !== 'poll'" class="flex items-center justify-between text-sm text-slate-500">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full px-1"
            :class="topic.liked ? 'text-brand' : 'hover:text-slate-800'"
            :aria-pressed="topic.liked"
            @click="emit('like')"
          >
            <AppIcon name="like" class="h-4 w-4" />
            <span>{{ topic.likes }}</span>
            <span class="sr-only">apoyos</span>
          </button>
          <span class="inline-flex items-center gap-1">
            <AppIcon name="comment" class="h-4 w-4" />
            {{ topic.comments }}
            <span class="sr-only">comentarios</span>
          </span>
        </div>
        <span class="inline-flex items-center gap-1">
          <AppIcon name="share" class="h-4 w-4" />
          {{ topic.shares }}
          <span class="sr-only">veces compartido</span>
        </span>
      </div>
    </div>
  </article>
</template>
