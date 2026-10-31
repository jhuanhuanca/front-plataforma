<script setup lang="ts">
import { accountTabs } from '../data/profile'
import ProfileHeader from '../components/account/ProfileHeader.vue'
import ParticipationSummary from '../components/account/ParticipationSummary.vue'
import DeleteAccount from '../components/account/DeleteAccount.vue'
import ConnectionList from '../components/account/ConnectionList.vue'
import FriendGrid from '../components/account/FriendGrid.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { mediaUrl } from '../lib/mediaUrl'
import { useRouter } from 'vue-router'
import { fetchStanding } from '../api/standing'
import { useAccountStore } from '../stores/account'
import { useAuthStore } from '../stores/auth'

const account = useAccountStore()
const auth = useAuthStore()
const router = useRouter()
const silenced = ref(false)
const silencedUntil = ref<string | null>(null)
const photoNotice = ref('')
const visibleName = ref('')
const shownAvatar = computed(() => mediaUrl(auth.avatar))
const shownCover = computed(() => mediaUrl(auth.cover))
const joinedLabel = computed(() => formatJoined(auth.joinedAt))

watch(
  () => auth.nick,
  (nick) => {
    if (visibleName.value === '' && nick) {
      visibleName.value = nick
    }
  },
  { immediate: true },
)

function formatJoined(value: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function saveName(next: string): void {
  const text = next.trim()
  if (text.length < 3) {
    account.notice = 'El nombre visible necesita al menos 3 caracteres.'
    return
  }

  visibleName.value = text
  account.notice = ''
}

async function changePhoto(file: File): Promise<void> {
  photoNotice.value = ''
  const saved = await auth.changeAvatar(file)
  photoNotice.value = saved ? 'Foto de perfil actualizada.' : auth.error
}

async function changeCover(file: File): Promise<void> {
  photoNotice.value = ''
  const saved = await auth.changeCover(file)
  photoNotice.value = saved ? 'Foto de portada actualizada.' : auth.error
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    return
  }

  void account.loadPeople()

  try {
    const standing = await fetchStanding()
    silenced.value = standing.silenced
    silencedUntil.value = standing.until
  } catch {
    silenced.value = false
  }
})

async function logout(): Promise<void> {
  await auth.logout()
  await router.push('/ingresar')
}

const toneClass = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
} as const
</script>

<template>
  <div class="mx-auto grid w-full min-w-0 max-w-[1100px] gap-4 px-3 py-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-4">
    <div class="min-w-0 space-y-4">
      <section class="flex flex-col gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80 sm:flex-row sm:items-center sm:justify-between">
        <p v-if="auth.isAuthenticated" class="text-sm text-slate-700">
          Sesión de <strong>{{ auth.nick }}</strong> en este dispositivo.
        </p>
        <p v-else class="text-sm text-slate-700">Este dispositivo todavía no tiene sesión.</p>
        <button
          v-if="auth.isAuthenticated"
          type="button"
          class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium"
          :disabled="auth.loading"
          @click="logout"
        >
          Salir
        </button>
        <RouterLink v-else to="/ingresar" class="rounded-md bg-brand px-4 py-2 text-center text-sm font-semibold text-white">
          Ingresar o crear cuenta
        </RouterLink>
      </section>

      <p
        v-if="silenced"
        class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200"
        role="status"
      >
        Tu cuenta está silenciada{{ silencedUntil ? ` hasta el ${silencedUntil}` : '' }}. Puedes seguir leyendo y borrar la cuenta.
      </p>

      <DeleteAccount v-if="auth.isAuthenticated" />

      <ProfileHeader
        :name="visibleName || 'Sin sesión'"
        :voices="account.listedPeople.length"
        role=""
        place=""
        :joined="joinedLabel"
        :cover="shownCover"
        :avatar="shownAvatar"
        :editable="auth.isAuthenticated"
        :can-change-photo="auth.isAuthenticated"
        @save="saveName"
        @photo="changePhoto"
        @cover="changeCover"
      />

      <p v-if="photoNotice" class="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" role="status">
        {{ photoNotice }}
      </p>

      <p v-if="account.notice" class="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" role="status">
        {{ account.notice }}
      </p>

      <div class="min-w-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <div class="flex gap-1 overflow-x-auto border-b border-slate-100 px-2" role="tablist" aria-label="Secciones de la cuenta">
          <button
            v-for="item in accountTabs"
            :key="item.id"
            type="button"
            role="tab"
            class="shrink-0 border-b-2 px-3 py-3 text-sm font-medium"
            :class="account.tab === item.id ? 'border-brand text-brand' : 'border-transparent text-slate-600'"
            :aria-selected="account.tab === item.id"
            @click="account.tab = item.id"
          >
            {{ item.label }}
            <span v-if="item.id === 'conexiones'" class="ml-1 rounded bg-emerald-50 px-1.5 text-xs text-emerald-700">
              {{ account.listedPeople.length }}
            </span>
          </button>
        </div>

        <div v-if="account.tab !== 'conexiones'" class="p-4 sm:p-5" role="tabpanel">
          <p v-if="account.tab === 'publicaciones'" class="text-sm text-slate-700">Esta cuenta todavía no tiene publicaciones.</p>
          <p v-else-if="account.tab === 'acerca'" class="min-h-6 text-sm text-slate-700"></p>
          <div v-else-if="account.tab === 'medios'" class="grid grid-cols-2 gap-2 sm:grid-cols-3"></div>
          <p v-else-if="account.tab === 'videos'" class="min-h-6 text-sm text-slate-700"></p>
          <p v-else-if="account.tab === 'convocatorias'" class="min-h-6 text-sm text-slate-700"></p>
          <ParticipationSummary v-else-if="account.tab === 'actividad' && auth.isAuthenticated" />
          <p v-else class="text-sm text-slate-700">Entra para ver tu participación.</p>
        </div>
      </div>

      <ConnectionList
        v-if="account.tab === 'conexiones' && auth.isAuthenticated"
        :people="account.visiblePeople"
        :total="account.listedPeople.length"
        :expanded="account.showAllConnections"
        :loading="account.peopleLoading"
        :error="account.peopleError"
        :query="account.peopleQuery"
        @update:query="account.peopleQuery = $event"
        @search="account.loadPeople()"
        @remove="account.removeConnection"
        @message="account.message"
        @expand="account.showAllConnections = true"
      />
      <section
        v-else-if="account.tab === 'conexiones'"
        class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
      >
        <h2 class="text-lg font-semibold">Conexiones</h2>
        <p class="py-6 text-sm text-slate-600">Entra para ver personas que ya están registradas.</p>
      </section>
    </div>

    <aside class="min-w-0 space-y-4">
      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h2 class="font-semibold">Acerca de</h2>
        <p class="mt-2 min-h-6 text-sm leading-relaxed text-slate-600"></p>
        <ul class="mt-4 space-y-2 text-sm text-slate-600">
          <li class="flex items-start gap-2">
            <AppIcon name="calendar" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span v-if="joinedLabel">Se unió el {{ joinedLabel }}</span>
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="pin" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="users" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          </li>
        </ul>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Experiencia</h2>
          <button type="button" class="text-brand" aria-label="Añadir experiencia" @click="account.addingExperience = !account.addingExperience">
            <AppIcon name="plus" class="h-5 w-5" />
          </button>
        </div>
        <form v-if="account.addingExperience" class="mt-3 flex gap-2" @submit.prevent="account.addExperience()">
          <label class="sr-only" for="nueva-mesa">Mesa o espacio</label>
          <input
            id="nueva-mesa"
            v-model="account.experienceDraft"
            type="text"
            placeholder="Mesa o espacio"
            class="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
          />
          <button type="submit" class="rounded-md bg-brand px-3 text-sm font-semibold text-white">Añadir</button>
        </form>
        <ul class="mt-3 space-y-3">
          <li v-for="item in account.experiences" :key="item.id" class="flex gap-3">
            <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" :class="toneClass[item.tone]">
              <AppIcon name="users" class="h-4 w-4" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-semibold">{{ item.place }}</p>
              <p class="break-words text-xs text-slate-500">{{ item.detail }}</p>
            </div>
          </li>
        </ul>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold uppercase tracking-wide text-slate-500">Fotos</h2>
          <button type="button" class="text-sm font-medium text-brand" @click="account.showAllPhotos = !account.showAllPhotos">
            {{ account.showAllPhotos ? 'Ver menos' : 'Ver todas las fotos' }}
          </button>
        </div>
        <ul class="mt-3 grid grid-cols-2 gap-2" :class="account.showAllPhotos ? 'sm:grid-cols-3' : ''"></ul>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Amigos
            <span class="ml-1 rounded bg-rose-50 px-1.5 text-sm text-rose-600">0</span>
          </h2>
        </div>
        <div class="mt-3">
          <FriendGrid :people="[]" :following="account.following" @message="account.message" @follow="account.toggleFollow" />
        </div>
      </section>
    </aside>
  </div>
</template>
