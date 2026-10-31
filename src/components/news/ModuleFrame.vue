<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { mediaUrl } from '../../lib/mediaUrl'
import PersonMark from '../ui/PersonMark.vue'
import AppIcon from '../ui/AppIcon.vue'
import BrandLogo from '../brand/BrandLogo.vue'
import { useAuthStore } from '../../stores/auth'
import { useDebateStore } from '../../stores/debates'
import { useNewsStore } from '../../stores/news'

const route = useRoute()
const auth = useAuthStore()
const debates = useDebateStore()
const news = useNewsStore()

const menu = [
  { to: '/debates', label: 'Feed', icon: 'home' as const },
  { to: '/debates', label: 'Argumentos', icon: 'users' as const },
  { to: '/noticias', label: 'Últimas noticias', icon: 'news' as const },
  { to: '/votaciones', label: 'Votaciones', icon: 'vote' as const },
  { to: '/votaciones', label: 'Convocatorias', icon: 'calendar' as const },
  { to: '/debates', label: 'Grupos', icon: 'groups' as const },
  { to: '/cuenta', label: 'Ajustes', icon: 'settings' as const },
]

const displayName = computed(() => (auth.isAuthenticated && auth.nick ? auth.nick : 'Invitado'))
const sessionAvatar = computed(() => mediaUrl(auth.avatar))
const sessionCover = computed(() => mediaUrl(auth.cover))
const withDebate = computed(() => news.items.filter((item) => item.debateId !== null).length)
const sourceCount = computed(() => new Set(news.items.map((item) => item.source)).size)
const onNews = computed(() => route.name === 'news' || route.name === 'news-item')

onMounted(() => {
  if (debates.items.length === 0) {
    void debates.load()
  }
})
</script>

<template>
  <div class="mx-auto grid w-full min-w-0 max-w-[1200px] gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid-cols-[270px_minmax(0,1fr)_300px]">
    <aside class="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:self-start">
      <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <img v-if="sessionCover" :src="sessionCover" alt="" class="h-16 w-full object-cover" />
        <div v-else class="h-16 bg-brand"></div>
        <div class="-mt-8 px-4 pb-4 text-center">
          <PersonMark :src="sessionAvatar" :label="displayName" class="mx-auto h-16 w-16 rounded-full text-xl ring-4 ring-white" />
          <h2 class="mt-2 text-lg font-semibold">{{ displayName }}</h2>
          <p class="text-xs text-slate-500">
            {{ auth.isAuthenticated ? 'Sesión en este dispositivo' : 'Aún sin nick' }}
          </p>
          <dl class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt class="text-xs text-slate-500">Noticias</dt>
              <dd class="font-semibold">{{ news.items.length }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Debates</dt>
              <dd class="font-semibold">{{ withDebate }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Fuentes</dt>
              <dd class="font-semibold">{{ sourceCount }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <nav aria-label="De las noticias" class="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
        <RouterLink
          v-for="item in menu"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-canvas"
          :class="item.to === '/noticias' && onNews ? 'bg-canvas text-brand' : 'text-slate-700'"
          :aria-current="item.to === '/noticias' && onNews ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" class="h-5 w-5 text-slate-500" />
          {{ item.label }}
        </RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/cuenta" class="mt-1 block px-3 py-2 text-center text-sm text-brand">
          Tu cuenta
        </RouterLink>
        <RouterLink v-else to="/ingresar" class="mt-1 block px-3 py-2 text-center text-sm text-brand">
          Entrar
        </RouterLink>
      </nav>
    </aside>

    <section class="min-w-0 space-y-3 sm:space-y-4">
      <RouterLink to="/cuenta" class="flex items-center gap-3 px-1 py-1 lg:hidden">
        <BrandLogo variant="mark" decorative />
        <span class="text-lg font-semibold">{{ auth.isAuthenticated && auth.nick ? auth.nick : 'Mi perfil' }}</span>
      </RouterLink>
      <slot />
    </section>

    <aside class="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:self-start">
      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h2 class="font-semibold">Debates abiertos</h2>
        <ul class="mt-3 space-y-3">
          <li v-for="post in debates.items.slice(0, 4)" :key="post.id">
            <RouterLink :to="`/debates/${post.id}`" class="block text-sm font-medium text-slate-800 hover:text-brand">
              {{ post.author }}
            </RouterLink>
            <p class="line-clamp-2 text-xs text-slate-500">{{ post.body }}</p>
          </li>
        </ul>
        <p v-if="debates.items.length === 0" class="mt-3 text-sm text-slate-500">Todavía no hay debates en esta columna.</p>
        <RouterLink to="/debates" class="mt-3 inline-block text-sm text-brand">Ver el feed</RouterLink>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h2 class="font-semibold">Votaciones</h2>
        <p class="mt-2 text-sm text-slate-600">Las propuestas abiertas siguen en su propio módulo.</p>
        <RouterLink to="/votaciones" class="mt-3 inline-block text-sm text-brand">Ver votaciones</RouterLink>
      </section>
    </aside>
  </div>
</template>
