<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const offline = ref(typeof navigator !== 'undefined' && !navigator.onLine)

function update(): void {
  offline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
})

onUnmounted(() => {
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
})
</script>

<template>
  <p v-if="offline" class="bg-slate-900 px-4 py-2 text-center text-sm text-white" role="status">
    Estás sin conexión. Debates, noticias y votaciones vuelven cuando haya red.
  </p>
</template>
