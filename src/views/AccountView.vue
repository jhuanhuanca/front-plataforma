<script setup lang="ts">
import { accountTabs, profileAvatar, profileCover, profilePhotos } from '../data/profile'
import ProfileHeader from '../components/account/ProfileHeader.vue'
import ParticipationSummary from '../components/account/ParticipationSummary.vue'
import DeleteAccount from '../components/account/DeleteAccount.vue'
import ConnectionList from '../components/account/ConnectionList.vue'
import FriendGrid from '../components/account/FriendGrid.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchStanding } from '../api/standing'
import { useAccountStore } from '../stores/account'
import { useAuthStore } from '../stores/auth'

const account = useAccountStore()
const auth = useAuthStore()
const router = useRouter()
const silenced = ref(false)
const silencedUntil = ref<string | null>(null)

onMounted(async () => {
  if (!auth.isAuthenticated) {
    return
  }

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
        :name="auth.isAuthenticated && auth.nick ? auth.nick : account.name"
        :voices="account.connections.length"
        role="Mesa de movilidad"
        place="Barrio norte"
        joined="26 de noviembre de 2019"
        :cover="profileCover"
        :avatar="profileAvatar"
        :editable="!auth.isAuthenticated"
        @save="account.saveName"
      />

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
              {{ account.connections.length }}
            </span>
          </button>
        </div>

        <div v-if="account.tab !== 'conexiones'" class="p-4 sm:p-5" role="tabpanel">
          <div v-if="account.tab === 'publicaciones'" class="space-y-3 text-sm text-slate-700">
            <p>El borrador del transporte nocturno ya se puede comentar antes de la votación del martes.</p>
            <p>Si el orden de las obras se decide solo por likes, los barrios con menos gente conectada quedan últimos.</p>
            <RouterLink to="/debates" class="inline-block font-medium text-brand">Ir a debates</RouterLink>
          </div>

          <div v-else-if="account.tab === 'acerca'" class="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              Coordino la mesa de movilidad del barrio norte. Me importa que el horario real del bus y el agua queden escritos antes de votar.
            </p>
            <p>Territorio: barrio norte. Mesa: movilidad y cuidados.</p>
          </div>

          <div v-else-if="account.tab === 'medios'" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <img v-for="item in profilePhotos" :key="item.id" :src="item.image" :alt="item.label" class="h-28 w-full rounded-lg object-cover" />
          </div>

          <div v-else-if="account.tab === 'videos'" class="text-sm text-slate-700">
            <p>La audiencia del presupuesto tiene una vista previa en el inicio. El archivo se publica cuando la fuente esté verificada.</p>
            <RouterLink to="/" class="mt-3 inline-block font-medium text-brand">Ver el inicio</RouterLink>
          </div>

          <div v-else-if="account.tab === 'convocatorias'" class="text-sm text-slate-700">
            <p>Hay votaciones abiertas sobre el presupuesto, el horario del mercado y el punto de cuidado.</p>
            <RouterLink to="/votaciones" class="mt-3 inline-block font-medium text-brand">Ir a votaciones</RouterLink>
          </div>

          <div v-else-if="account.tab === 'actividad'">
            <ParticipationSummary v-if="auth.isAuthenticated" />
            <p v-else class="text-sm text-slate-700">
              Entra para ver tu participación.
              <RouterLink to="/ingresar" class="font-medium text-brand">Ingresar</RouterLink>
            </p>
          </div>
        </div>
      </div>

      <ConnectionList
        v-if="account.tab === 'conexiones'"
        :people="account.visibleConnections"
        :total="account.connections.length"
        :expanded="account.showAllConnections"
        @remove="account.removeConnection"
        @message="account.message"
        @expand="account.showAllConnections = true"
      />
    </div>

    <aside class="min-w-0 space-y-4">
      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h2 class="font-semibold">Acerca de</h2>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          Coordino la mesa de movilidad del barrio norte. Me importa que el horario real del bus y el agua queden escritos antes de votar.
        </p>
        <ul class="mt-4 space-y-2 text-sm text-slate-600">
          <li class="flex items-start gap-2">
            <AppIcon name="calendar" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            En la mesa desde 2019
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="pin" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            Barrio norte
          </li>
          <li class="flex items-start gap-2">
            <AppIcon name="users" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            Mesa de movilidad
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
        <ul class="mt-3 grid grid-cols-2 gap-2" :class="account.showAllPhotos ? 'sm:grid-cols-3' : ''">
          <li v-for="item in account.showAllPhotos ? profilePhotos : profilePhotos.slice(0, 5)" :key="item.id">
            <img :src="item.image" :alt="item.label" class="h-24 w-full rounded-lg object-cover" />
          </li>
        </ul>
      </section>

      <section class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Amigos
            <span class="ml-1 rounded bg-rose-50 px-1.5 text-sm text-rose-600">{{ account.friends.length }}</span>
          </h2>
        </div>
        <div class="mt-3">
          <FriendGrid :people="account.friends" :following="account.following" @message="account.message" @follow="account.toggleFollow" />
        </div>
      </section>
    </aside>
  </div>
</template>
