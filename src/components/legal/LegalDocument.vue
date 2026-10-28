<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <article class="mx-auto max-w-2xl px-4 py-8 sm:py-12">
    <h1 class="text-3xl font-semibold tracking-tight">{{ title }}</h1>
    <p class="mt-2 text-sm text-slate-500">Vigente desde el 15 de octubre de 2026.</p>
    <div class="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
      <slot />
    </div>
  </article>
</template>
