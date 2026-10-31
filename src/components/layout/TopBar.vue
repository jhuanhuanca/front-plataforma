<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BrandLogo from '../brand/BrandLogo.vue'
import AppIcon from '../ui/AppIcon.vue'
import NotificationBell from './NotificationBell.vue'
import { mediaUrl } from '../../lib/mediaUrl'
import PersonMark from '../ui/PersonMark.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebateStore } from '../../stores/debates'

const route = useRoute()
const router = useRouter()
const debates = useDebateStore()
const auth = useAuthStore()
const menuOpen = ref(false)
const headerAvatar = computed(() => mediaUrl(auth.avatar))
const headerLabel = computed(() => auth.nick ?? 'Cuenta')

const links = [
  { to: '/', label: 'Inicio', match: 'home' },
  { to: '/debates', label: 'Debates', match: 'debates' },
  { to: '/votaciones', label: 'Votaciones', match: 'polls' },
  { to: '/cuenta', label: 'Cuenta', match: 'account' },
]

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

function isActive(name: string): boolean {
  if (name === 'debates') {
    return route.name === 'debates' || route.name === 'debate'
  }

  return route.name === name
}

function submitSearch(): void {
  const q = debates.query.trim()
  if (q.length < 2) {
    return
  }

  void router.push({ name: 'search', query: { q } })
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white">
    <div class="h-1 bg-accent" aria-hidden="true"></div>
    <div class="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-3 md:h-16 md:gap-3 md:px-4">
      <RouterLink to="/" class="shrink-0" aria-label="EnAgenda, inicio">
        <BrandLogo decorative class="hidden sm:block" />
        <BrandLogo variant="mark" decorative class="sm:hidden" />
      </RouterLink>

      <form v-if="route.name === 'debates'" class="hidden min-w-0 flex-1 md:block md:max-w-xs" @submit.prevent="submitSearch">
        <label class="sr-only" for="buscar-cabecera">Buscar debates</label>
        <div class="flex items-center rounded-full bg-canvas px-3">
          <AppIcon name="search" class="h-4 w-4 text-slate-500" />
          <input
            id="buscar-cabecera"
            v-model="debates.query"
            type="search"
            placeholder="Buscar..."
            class="h-10 w-full bg-transparent px-2 text-sm text-slate-800 outline-none"
          />
        </div>
      </form>

      <nav aria-label="Principal" class="ml-auto hidden items-center gap-6 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium"
          :class="isActive(link.match) ? 'text-brand underline decoration-accent decoration-2 underline-offset-8' : 'text-ink hover:text-brand'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-1.5 md:ml-4">
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="menu-movil"
          @click="menuOpen = !menuOpen"
        >
          <span class="sr-only">Abrir menú</span>
          <AppIcon name="menu" class="h-5 w-5" />
        </button>
        <RouterLink
          to="/debates"
          class="h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 md:h-9 md:w-9 md:rounded-full md:bg-transparent"
          :class="route.name === 'polls' ? 'hidden md:grid' : 'grid'"
          aria-label="Mensajes de debates"
        >
          <AppIcon name="message" class="h-5 w-5" />
        </RouterLink>
        <RouterLink
          to="/cuenta"
          class="h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 md:h-9 md:w-9 md:rounded-full md:bg-transparent"
          :class="route.name === 'polls' ? 'hidden md:grid' : 'grid'"
          aria-label="Ajustes de cuenta"
        >
          <AppIcon name="settings" class="h-5 w-5" />
        </RouterLink>
        <div :class="route.name === 'polls' ? 'hidden md:block' : ''">
          <NotificationBell v-if="auth.isAuthenticated" />
          <RouterLink
            v-else
            to="/ingresar"
            class="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 md:h-9 md:w-9 md:rounded-full md:bg-transparent"
            aria-label="Avisos"
          >
            <AppIcon name="bell" class="h-5 w-5" />
          </RouterLink>
        </div>
        <RouterLink to="/cuenta" class="h-10 w-10 overflow-hidden rounded-full bg-slate-200" aria-label="Tu cuenta">
          <PersonMark :src="headerAvatar" :label="headerLabel" class="h-full w-full" />
        </RouterLink>
      </div>
    </div>

    <nav
      v-if="menuOpen"
      id="menu-movil"
      aria-label="Móvil"
      class="border-t border-slate-100 bg-white px-3 py-2 md:hidden"
    >
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block rounded-lg px-3 py-3 text-sm font-medium"
        :class="isActive(link.match) ? 'bg-brand-soft text-brand' : 'text-ink'"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
  </header>
</template>
