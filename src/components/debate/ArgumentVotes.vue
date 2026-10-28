<script setup lang="ts">
defineProps<{
  favor: number
  contra: number
  stance: 'favor' | 'contra' | null
}>()

const emit = defineEmits<{
  vote: [stance: 'favor' | 'contra']
}>()
</script>

<template>
  <button
    type="button"
    class="font-medium"
    :class="stance === 'favor' ? 'text-brand' : ''"
    :aria-pressed="stance === 'favor'"
    @click="emit('vote', 'favor')"
  >
    A favor ({{ favor }})
  </button>
  <button
    type="button"
    class="font-medium"
    :class="stance === 'contra' ? 'text-rose-700' : ''"
    :aria-pressed="stance === 'contra'"
    @click="emit('vote', 'contra')"
  >
    En contra ({{ contra }})
  </button>
</template>
