<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { pollCategories, type Poll } from '../data/polls'
import { photo } from '../data/images'
import AppIcon from '../components/ui/AppIcon.vue'
import { usePollStore } from '../stores/polls'

const polls = usePollStore()
const notice = ref('')

onMounted(() => {
  void polls.load()
})

const categoryIcons = {
  territorio: 'home',
  economia: 'news',
  cultura: 'calendar',
  movilidad: 'share',
  cuidados: 'users',
} as const

function percent(poll: Poll, votes: number): number {
  const total = polls.total(poll)
  if (total === 0) {
    return 0
  }

  return Math.round((votes / total) * 100)
}

function submitSearch(): void {
  polls.search()
  document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function choose(pollId: string, optionId: string): Promise<void> {
  const result = await polls.vote(pollId, optionId)
  notice.value = result.message
}
</script>

<template>
  <div>
    <section class="relative isolate min-h-[420px] overflow-hidden">
      <div class="absolute inset-0 grid grid-cols-4 grid-rows-2">
        <img :src="photo('photo-1492684223066-81342ee5ff30', 800)" alt="" class="col-span-2 row-span-2 h-full w-full object-cover" />
        <img :src="photo('photo-1514525253161-7a46d19cd819', 600)" alt="" class="h-full w-full object-cover" />
        <img :src="photo('photo-1429962714451-bb934ecdc4ec', 600)" alt="" class="h-full w-full object-cover" />
        <img :src="photo('photo-1501281668745-f7f57925c3b4', 600)" alt="" class="h-full w-full object-cover" />
        <img :src="photo('photo-1470229722913-7c0e2dbbafd3', 600)" alt="" class="h-full w-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-slate-950/60"></div>

      <div class="relative mx-auto flex min-h-[460px] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center text-white sm:min-h-[420px] sm:py-16">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Vota las propuestas abiertas</h1>
        <p class="mt-2 max-w-md text-sm text-white/85">
          {{ polls.remote ? 'Elige una opción. El voto queda en tu cuenta.' : 'Elige una opción. Tu voto queda en este dispositivo hasta que la cuenta esté conectada.' }}
        </p>

        <form class="mt-6 w-full rounded-xl bg-white p-4 text-left text-slate-900 shadow-xl" @submit.prevent="submitSearch">
          <p class="text-base font-semibold">Te ayudamos a encontrar una votación</p>
          <div class="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
            <div>
              <label class="sr-only" for="que">Qué</label>
              <input id="que" v-model="polls.topic" type="search" placeholder="Qué" class="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand" />
            </div>
            <div class="relative">
              <label class="sr-only" for="donde">Dónde</label>
              <input id="donde" v-model="polls.place" type="search" placeholder="Dónde" class="h-11 w-full rounded-md border border-slate-200 px-3 pr-12 text-sm outline-none focus:border-brand" />
              <button type="button" class="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-slate-500 md:hidden" aria-label="Limpiar filtros" @click="polls.topic = ''; polls.place = ''; polls.category = 'todas'; polls.search()">
                <AppIcon name="filter" class="h-5 w-5" />
              </button>
            </div>
            <button type="button" class="hidden h-11 w-11 place-items-center rounded-md border border-slate-200 text-slate-600 md:grid" aria-label="Limpiar filtros" @click="polls.topic = ''; polls.place = ''; polls.category = 'todas'; polls.search()">
              <AppIcon name="filter" class="h-5 w-5" />
            </button>
            <button type="submit" class="h-11 rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-deep md:w-auto">
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>

    <div class="mx-auto max-w-[1100px] bg-white px-4 py-6 sm:bg-transparent sm:py-8">
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <li v-for="category in pollCategories" :key="category.id">
          <button
            type="button"
            class="flex h-full w-full flex-col items-center gap-3 rounded-xl bg-white px-3 py-8 text-center text-sm shadow-sm ring-1 ring-slate-200/80 sm:py-4"
            :class="polls.category === category.id ? 'text-brand ring-brand' : 'text-slate-700'"
            :aria-pressed="polls.category === category.id"
            @click="polls.category = polls.category === category.id ? 'todas' : category.id"
          >
            <AppIcon :name="categoryIcons[category.id]" class="h-6 w-6" />
            {{ category.label }}
          </button>
        </li>
      </ul>

      <div id="resultados" class="mt-8 flex flex-col items-start gap-1 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
        <h2 class="text-2xl font-semibold">Descubre votaciones</h2>
        <button type="button" class="text-sm font-medium text-brand" @click="polls.category = 'todas'; polls.topic = ''; polls.place = ''; polls.search()">
          Ver todas
        </button>
      </div>

      <p v-if="polls.loadError" class="mt-6 text-sm text-slate-600" role="status">{{ polls.loadError }}</p>
      <p v-if="notice" class="mt-4 text-sm text-slate-700" role="status">{{ notice }}</p>

      <p v-if="polls.loading && polls.items.length === 0" class="mt-8 text-slate-600" role="status">
        Cargando votaciones...
      </p>

      <p v-else-if="polls.visible.length === 0" class="mt-8 text-slate-600" role="status">
        No hay votaciones con ese criterio.
      </p>

      <ul v-else class="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <li v-for="poll in polls.visible" :key="poll.id" class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div class="relative h-36 bg-slate-200">
            <img :src="poll.image" alt="" class="h-full w-full object-cover" loading="lazy" />
            <span class="absolute right-2 top-2 rounded bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
              {{ poll.badge }}
            </span>
          </div>
          <div class="space-y-3 p-4">
            <h3 class="text-sm font-semibold leading-snug">{{ poll.title }}</h3>
            <p class="text-xs text-slate-500">{{ poll.place }}</p>
            <fieldset class="space-y-2">
              <legend class="sr-only">Opciones de {{ poll.title }}</legend>
              <button
                v-for="option in poll.options"
                :key="option.id"
                type="button"
                class="w-full rounded-lg border px-3 py-2 text-left text-sm"
                :class="poll.votedOptionId === option.id ? 'border-brand bg-brand-soft text-brand' : 'border-slate-200 hover:border-slate-400'"
                :disabled="poll.votedOptionId !== null && poll.votedOptionId !== option.id"
                :aria-pressed="poll.votedOptionId === option.id"
                @click="choose(poll.id, option.id)"
              >
                <span class="flex items-center justify-between gap-2">
                  <span>{{ option.label }}</span>
                  <span v-if="poll.votedOptionId">{{ percent(poll, option.votes) }}%</span>
                </span>
                <span v-if="poll.votedOptionId" class="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <span class="block h-full bg-brand" :style="{ width: `${percent(poll, option.votes)}%` }"></span>
                </span>
              </button>
            </fieldset>
            <p v-if="poll.votedOptionId" class="text-xs text-slate-500">
              {{ polls.remote ? 'Voto registrado.' : 'Voto registrado en este navegador.' }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
