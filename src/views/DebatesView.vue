<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DebateCard from '../components/debate/DebateCard.vue'
import PersonMark from '../components/ui/PersonMark.vue'
import ArgumentEditor from '../components/debate/ArgumentEditor.vue'
import MediaAttachment from '../components/debate/MediaAttachment.vue'
import BrandLogo from '../components/brand/BrandLogo.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { sendToRegister } from '../lib/accountGate'
import { mediaUrl } from '../lib/mediaUrl'
import { useAccountStore } from '../stores/account'
import { useAuthStore } from '../stores/auth'
import { useDebateStore } from '../stores/debates'
import { useNewsStore } from '../stores/news'

const debates = useDebateStore()
const account = useAccountStore()
const auth = useAuthStore()
const sessionAvatar = computed(() => mediaUrl(auth.avatar))
const sessionCover = computed(() => mediaUrl(auth.cover))
const displayName = computed(() => (auth.isAuthenticated && auth.nick ? auth.nick : 'Invitado'))
const news = useNewsStore()
const route = useRoute()
const router = useRouter()
const draft = ref('')
const composerError = ref('')
const notice = ref('')
const mediaKind = ref<'image' | 'video' | null>(null)
const mediaLink = ref('')
const mediaFile = ref<File | null>(null)
const showCall = ref(false)

const menu = [
  { to: '/debates', label: 'Feed', icon: 'home' as const },
  { to: '/debates', label: 'Argumentos', icon: 'users' as const },
  { to: '/noticias', label: 'Últimas noticias', icon: 'news' as const },
  { to: '/votaciones', label: 'Votaciones', icon: 'vote' as const },
  { to: '/votaciones', label: 'Convocatorias', icon: 'calendar' as const },
  { to: '/debates', label: 'Grupos', icon: 'groups' as const },
  { to: '/cuenta', label: 'Ajustes', icon: 'settings' as const },
]

function chooseMedia(kind: 'image' | 'video'): void {
  showCall.value = false
  composerError.value = ''
  if (mediaKind.value === kind) {
    mediaKind.value = null
    mediaFile.value = null
    mediaLink.value = ''
    return
  }

  mediaFile.value = null
  mediaLink.value = ''
  mediaKind.value = kind
}

function mediaProblem(): string {
  if (mediaKind.value === null) {
    return ''
  }

  const link = mediaLink.value.trim()
  const file = mediaFile.value
  if (file && link) {
    return 'Sube un archivo o pega un enlace, no los dos.'
  }
  if (link && !link.startsWith('https://')) {
    return 'El enlace tiene que empezar por https://.'
  }
  if (!file) {
    return ''
  }

  const image = mediaKind.value === 'image'
  const allowed = image
    ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    : ['video/mp4', 'video/webm']
  if (file.type !== '' && !allowed.includes(file.type)) {
    return image
      ? 'La imagen tiene que ser JPG, PNG, WEBP o GIF.'
      : 'El video tiene que ser MP4 o WebM.'
  }

  const max = image ? 8 * 1024 * 1024 : 50 * 1024 * 1024
  if (file.size > max) {
    return image ? 'La imagen no puede pasar de 8 MB.' : 'El video no puede pasar de 50 MB.'
  }

  return ''
}

async function publish(): Promise<void> {
  composerError.value = mediaProblem()
  if (composerError.value !== '') {
    return
  }

  const media = mediaKind.value === null
    ? null
    : { kind: mediaKind.value, file: mediaFile.value, link: mediaLink.value }
  const result = await debates.addPost(draft.value, media)
  if (result.needsAccount) {
    sendToRegister(router, route)
    return
  }
  if (!result.ok) {
    composerError.value = result.message
    return
  }

  draft.value = ''
  mediaKind.value = null
  mediaLink.value = ''
  mediaFile.value = null
  notice.value = result.message
}

async function onLike(id: string): Promise<void> {
  const result = await debates.toggleLike(id)
  if (!result.ok && result.message.length > 0) {
    notice.value = result.message
  }
}

async function onComment(id: string, body: string, done: (message: string | null) => void): Promise<void> {
  const result = await debates.addComment(id, body)
  if (result.needsAccount) {
    sendToRegister(router, route)
    done(null)
    return
  }
  if (result.ok) {
    notice.value = result.message
    done(null)
    return
  }

  done(result.message)
}

async function onReply(id: string, commentId: string, body: string, done: (message: string | null) => void): Promise<void> {
  const result = await debates.addReply(id, commentId, body)
  if (result.needsAccount) {
    sendToRegister(router, route)
    done(null)
    return
  }
  if (result.ok) {
    notice.value = result.message
    done(null)
    return
  }

  done(result.message)
}

async function onVote(id: string, commentId: string, stance: 'favor' | 'contra'): Promise<void> {
  const result = await debates.castVote(id, commentId, stance)
  if (!result.ok && result.message.length > 0) {
    notice.value = result.message
  }
}

async function onCommentLike(postId: string, commentId: string): Promise<void> {
  const result = await debates.toggleCommentLike(postId, commentId)
  if (!result.ok && result.message.length > 0) {
    notice.value = result.message
  }
}

onMounted(() => {
  void debates.load().then(() => debates.followFeed())
  void news.load()
  void account.loadPeople()
})

onUnmounted(() => {
  debates.stopFeed()
})

async function share(id: string): Promise<void> {
  debates.share(id)
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/debates/${id}`)
    notice.value = 'Enlace del debate copiado.'
  } catch {
    notice.value = 'No se pudo copiar el enlace en este navegador.'
  }
}
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
          <p class="text-xs text-slate-500">{{ auth.isAuthenticated ? 'Sesión en este dispositivo' : 'Aún sin nick' }}</p>
          <p v-if="!auth.isAuthenticated" class="mt-2 text-sm text-slate-600">Entra para argumentar, votar y seguir un tema.</p>
          <dl class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt class="text-xs text-slate-500">Argumentos</dt>
              <dd class="font-semibold">0</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Apoyos</dt>
              <dd class="font-semibold">0</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-500">Votos</dt>
              <dd class="font-semibold">0</dd>
            </div>
          </dl>
        </div>
      </section>

      <nav aria-label="Del debate" class="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
        <RouterLink
          v-for="item in menu"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-canvas"
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
        <span class="text-lg font-semibold">{{ displayName }}</span>
      </RouterLink>

      <p v-if="notice" class="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" role="status">
        {{ notice }}
      </p>

      <form class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80" @submit.prevent="publish">
        <div class="flex gap-3">
          <PersonMark :src="sessionAvatar" :label="displayName" class="h-10 w-10 shrink-0 rounded-full" />
          <ArgumentEditor id="nuevo-argumento" v-model="draft" label="Escribe un argumento" placeholder="Escribe un argumento..." />
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            :class="mediaKind === 'image' ? 'border-emerald-600 text-emerald-700' : 'border-slate-200 text-slate-700'"
            :aria-pressed="mediaKind === 'image'"
            @click="chooseMedia('image')"
          >
            <AppIcon name="image" class="h-4 w-4 text-emerald-600" />
            Foto
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            :class="mediaKind === 'video' ? 'border-sky-600 text-sky-700' : 'border-slate-200 text-slate-700'"
            :aria-pressed="mediaKind === 'video'"
            @click="chooseMedia('video')"
          >
            <AppIcon name="video" class="h-4 w-4 text-sky-600" />
            Video
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            :aria-pressed="showCall"
            @click="showCall = !showCall; mediaKind = null"
          >
            <AppIcon name="calendar" class="h-4 w-4 text-rose-500" />
            Convocatoria
          </button>
          <button type="submit" class="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep sm:ml-auto sm:w-auto">
            Publicar
          </button>
        </div>
        <MediaAttachment v-model:kind="mediaKind" v-model:link="mediaLink" v-model:file="mediaFile" />
        <p v-if="showCall" class="mt-3 text-sm text-slate-600">
          Una convocatoria es una votación. Sigue en
          <RouterLink to="/votaciones" class="font-medium text-brand underline">Votaciones</RouterLink>
          si quieres abrir esa página.
        </p>
        <p v-if="composerError" class="mt-2 text-sm text-red-700" role="alert">{{ composerError }}</p>
      </form>

      <p v-if="debates.loadError" class="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" role="status">
        {{ debates.loadError }}
      </p>

      <p v-if="debates.loading" class="rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
        Cargando debates...
      </p>

      <p v-else-if="debates.visible.length === 0" class="rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
        No hay argumentos con esa búsqueda.
      </p>

      <DebateCard
        v-for="post in debates.visible"
        :key="post.id"
        :post="post"
        :thread-to="`/debates/${post.id}`"
        @like="onLike(post.id)"
        @share="share(post.id)"
        @comment="(body, done) => onComment(post.id, body, done)"
        @reply="(commentId, body, done) => onReply(post.id, commentId, body, done)"
        @vote="(commentId, stance) => onVote(post.id, commentId, stance)"
        @like-comment="onCommentLike(post.id, $event)"
      />
    </section>

    <aside class="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:self-start">
      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h2 class="font-semibold">Personas registradas</h2>
        <p v-if="!auth.isAuthenticated" class="mt-3 text-sm text-slate-600">Entra para ver cuentas que ya existen.</p>
        <p v-else-if="account.peopleLoading" class="mt-3 text-sm text-slate-600">Cargando personas...</p>
        <p v-else-if="account.people.length === 0" class="mt-3 text-sm text-slate-600">Todavía no hay otras cuentas.</p>
        <ul v-else class="mt-3 space-y-3">
          <li v-for="person in account.people" :key="person.id" class="flex items-center gap-3">
            <PersonMark :src="person.avatar" :label="person.nick" class="h-10 w-10 shrink-0 rounded-full" />
            <p class="min-w-0 flex-1 truncate text-sm font-semibold">{{ person.nick }}</p>
            <button
              type="button"
              class="rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand"
              @click="account.message(person.nick)"
            >
              Mensaje
            </button>
          </li>
        </ul>
        <RouterLink
          v-if="auth.isAuthenticated"
          to="/cuenta"
          class="mt-4 block w-full rounded-lg bg-brand-soft py-2 text-center text-sm font-medium text-brand"
          @click="account.tab = 'conexiones'"
        >
          Ver en tu cuenta
        </RouterLink>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Noticias de hoy</h2>
        </div>
        <ul class="mt-3 space-y-3">
          <li v-for="item in news.items.slice(0, 4)" :key="item.id">
            <RouterLink :to="`/noticias/${item.id}`" class="block text-sm font-medium text-slate-800 hover:text-brand">
              {{ item.title }}
            </RouterLink>
            <p class="text-xs text-slate-500">{{ item.time }}</p>
          </li>
        </ul>
        <RouterLink to="/noticias" class="mt-3 inline-block text-sm text-brand">Ver todas las noticias</RouterLink>
      </section>
    </aside>
  </div>
</template>
