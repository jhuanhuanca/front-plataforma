<script setup lang="ts">
import { computed } from 'vue'
import { argumentHtml } from '../../lib/argumentHtml'

const props = defineProps<{
  text: string
}>()

const html = computed(() => argumentHtml(props.text))
</script>

<template>
  <div class="argument-html break-words" v-html="html"></div>
</template>

<style scoped>
.argument-html :deep(p) {
  margin: 0;
}

.argument-html :deep(p + p),
.argument-html :deep(ul) {
  margin-top: 0.5rem;
}

.argument-html :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}

.argument-html :deep(a) {
  color: var(--color-brand);
  text-decoration: underline;
}

.argument-html :deep(code) {
  border-radius: 0.25rem;
  background: rgb(241 245 249);
  padding: 0 0.25rem;
}
</style>
