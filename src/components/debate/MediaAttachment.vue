<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const kind = defineModel<'image' | 'video' | null>('kind', { required: true })
const link = defineModel<string>('link', { required: true })
const file = defineModel<File | null>('file', { required: true })

const preview = ref('')
const input = ref<HTMLInputElement | null>(null)

const accept = computed(() => kind.value === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif')
const fileLabel = computed(() => kind.value === 'video' ? 'Elegir video del equipo' : 'Elegir imagen del equipo')
const linkLabel = computed(() => kind.value === 'video' ? 'Enlace del video' : 'Enlace de la imagen')

const playable = computed(() => kind.value === 'video' && /\.(mp4|webm)(\?|#|$)/i.test(preview.value))

watch(file, (next, previous) => {
  if (preview.value.startsWith('blob:')) {
    URL.revokeObjectURL(preview.value)
  }
  preview.value = next ? URL.createObjectURL(next) : link.value.trim()
  if (previous && next === null && input.value) {
    input.value.value = ''
  }
})

watch(link, (value) => {
  if (file.value === null) {
    preview.value = value.trim()
  }
})

onBeforeUnmount(() => {
  if (preview.value.startsWith('blob:')) {
    URL.revokeObjectURL(preview.value)
  }
})

function onFile(event: Event): void {
  const selected = (event.target as HTMLInputElement).files?.[0] ?? null
  link.value = ''
  file.value = selected
}

function clear(): void {
  file.value = null
  link.value = ''
  preview.value = ''
  if (input.value) {
    input.value.value = ''
  }
}
</script>

<template>
  <div v-if="kind" class="mt-3 rounded-lg bg-canvas p-3">
    <div class="flex flex-wrap gap-3">
      <label class="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-brand ring-1 ring-slate-200">
        {{ fileLabel }}
        <input
          ref="input"
          class="sr-only"
          type="file"
          :accept="accept"
          @change="onFile"
        />
      </label>
      <button type="button" class="text-sm text-slate-600 underline" @click="clear">
        Quitar
      </button>
    </div>
    <p v-if="file" class="mt-2 truncate text-sm text-slate-700">{{ file.name }}</p>
    <label class="mt-3 block text-sm font-medium" :for="`enlace-${kind}`">{{ linkLabel }}</label>
    <input
      :id="`enlace-${kind}`"
      v-model="link"
      type="url"
      maxlength="255"
      placeholder="https://..."
      class="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand"
      @input="file = null"
    />
    <img
      v-if="kind === 'image' && (preview.startsWith('https://') || preview.startsWith('blob:'))"
      :src="preview"
      alt=""
      class="mt-3 max-h-48 w-full rounded-md object-cover"
    />
    <video
      v-else-if="playable || (kind === 'video' && preview.startsWith('blob:'))"
      :src="preview"
      controls
      class="mt-3 max-h-48 w-full rounded-md"
      preload="metadata"
    />
    <a
      v-else-if="kind === 'video' && preview.startsWith('https://')"
      :href="preview"
      class="mt-3 inline-block text-sm font-medium text-brand underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Abrir el enlace del video
    </a>
  </div>
</template>
