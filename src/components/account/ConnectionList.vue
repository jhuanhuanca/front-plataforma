<script setup lang="ts">
import type { ProfileConnection } from '../../data/profile'

defineProps<{
  people: ProfileConnection[]
  total: number
  expanded: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  message: [nick: string]
  expand: []
}>()
</script>

<template>
  <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
    <h2 class="text-lg font-semibold">Conexiones</h2>
    <ul class="mt-4 divide-y divide-slate-100">
      <li v-for="person in people" :key="person.id" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        <img :src="person.avatar" alt="" class="h-12 w-12 shrink-0 rounded-full object-cover" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold">
            {{ person.name }}
            <span class="font-normal text-slate-500">{{ person.role }}</span>
          </p>
          <p class="break-words text-sm text-slate-500">{{ person.note }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button type="button" class="rounded-md bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600" @click="emit('remove', person.id)">
            Quitar
          </button>
          <button type="button" class="rounded-md bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand" @click="emit('message', person.nick)">
            Mensaje
          </button>
        </div>
      </li>
    </ul>
    <button
      v-if="!expanded && total > people.length"
      type="button"
      class="mt-2 w-full rounded-md bg-brand-soft py-2 text-sm font-medium text-brand"
      @click="emit('expand')"
    >
      Cargar más conexiones
    </button>
    <p v-if="people.length === 0" class="py-6 text-sm text-slate-600" role="status">No quedan conexiones en esta lista.</p>
  </section>
</template>
