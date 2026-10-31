<script setup lang="ts">
import PersonMark from '../ui/PersonMark.vue'
import type { RegisteredPerson } from '../../api/people'

defineProps<{
  people: RegisteredPerson[]
  total: number
  expanded: boolean
  loading: boolean
  error: string
  query: string
}>()

const emit = defineEmits<{
  remove: [id: number]
  message: [nick: string]
  expand: []
  search: []
  'update:query': [value: string]
}>()

function onQuery(event: Event): void {
  const input = event.target
  if (input instanceof HTMLInputElement) {
    emit('update:query', input.value)
  }
}
</script>

<template>
  <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
    <h2 class="text-lg font-semibold">Conexiones</h2>
    <form class="mt-4 flex gap-2" @submit.prevent="emit('search')">
      <label class="sr-only" for="buscar-persona">Buscar por nick</label>
      <input
        id="buscar-persona"
        :value="query"
        type="search"
        maxlength="20"
        placeholder="Buscar por nick"
        class="h-11 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
        @input="onQuery"
      />
      <button type="submit" class="rounded-md bg-brand px-4 text-sm font-semibold text-white">Buscar</button>
    </form>
    <p v-if="loading" class="py-6 text-sm text-slate-600" role="status">Cargando personas...</p>
    <p v-else-if="error" class="py-6 text-sm text-red-700" role="alert">{{ error }}</p>
    <ul v-else class="mt-4 divide-y divide-slate-100">
      <li v-for="person in people" :key="person.id" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        <PersonMark :src="person.avatar" :label="person.nick" class="h-12 w-12 shrink-0 rounded-full" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold">
            {{ person.nick }}
            <span class="font-normal text-slate-500"></span>
          </p>
          <p class="break-words text-sm text-slate-500"></p>
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
      v-if="!loading && !error && !expanded && total > people.length"
      type="button"
      class="mt-2 w-full rounded-md bg-brand-soft py-2 text-sm font-medium text-brand"
      @click="emit('expand')"
    >
      Cargar más conexiones
    </button>
    <p v-if="!loading && !error && people.length === 0" class="py-6 text-sm text-slate-600" role="status">No quedan conexiones en esta lista.</p>
  </section>
</template>
