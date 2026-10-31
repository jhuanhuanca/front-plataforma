<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src: string
  label: string
}>()

const initial = computed(() => {
  const text = props.label.trim()
  return text === '' ? '?' : text.charAt(0).toUpperCase()
})
</script>

<template>
  <img v-if="src" :src="src" alt="" class="object-cover" />
  <span v-else class="grid place-items-center bg-brand-soft font-semibold text-brand" aria-hidden="true">
    {{ initial }}
  </span>
</template>
