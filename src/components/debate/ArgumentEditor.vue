<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import ArgumentBody from './ArgumentBody.vue'

const text = defineModel<string>({ required: true })

defineProps<{
  id: string
  label: string
  placeholder: string
}>()

const area = ref<HTMLTextAreaElement | null>(null)

const showPreview = computed(() => text.value.trim().length > 0)

function wrap(before: string, after: string): void {
  const field = area.value
  if (!field) {
    text.value = `${text.value}${before}texto${after}`
    return
  }

  const start = field.selectionStart
  const end = field.selectionEnd
  const selected = text.value.slice(start, end) || 'texto'
  text.value = `${text.value.slice(0, start)}${before}${selected}${after}${text.value.slice(end)}`

  void nextTick(() => {
    field.focus()
    const cursor = start + before.length
    field.selectionStart = cursor
    field.selectionEnd = cursor + selected.length
  })
}
</script>

<template>
  <div class="min-w-0 flex-1">
    <div class="mb-2 flex flex-wrap gap-2">
      <button type="button" class="rounded-md bg-canvas px-2 py-1 text-xs font-semibold text-slate-700" @click="wrap('**', '**')">
        Negrita
      </button>
      <button type="button" class="rounded-md bg-canvas px-2 py-1 text-xs font-semibold text-slate-700" @click="wrap('*', '*')">
        Cursiva
      </button>
      <button type="button" class="rounded-md bg-canvas px-2 py-1 text-xs font-semibold text-slate-700" @click="wrap('[', '](https://)')">
        Enlace
      </button>
    </div>
    <label class="sr-only" :for="id">{{ label }}</label>
    <textarea
      :id="id"
      ref="area"
      v-model="text"
      rows="3"
      :placeholder="placeholder"
      class="min-h-16 w-full resize-y rounded-xl bg-canvas px-4 py-3 text-sm outline-none ring-brand focus:ring-2"
    />
    <p class="mt-2 text-xs text-slate-500">Negrita con **texto**, cursiva con *texto* y una lista con líneas que empiecen por -.</p>
    <div v-if="showPreview" class="mt-3 rounded-xl bg-canvas px-4 py-3 text-sm text-slate-800">
      <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Vista previa</p>
      <ArgumentBody :text="text" />
    </div>
  </div>
</template>
