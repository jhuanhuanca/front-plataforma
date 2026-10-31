<script setup lang="ts">
import { ref } from 'vue'
import PersonMark from '../ui/PersonMark.vue'
import AppIcon from '../ui/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    name: string
    voices: number
    role: string
    place: string
    joined: string
    cover: string
    avatar: string
    editable?: boolean
    canChangePhoto?: boolean
  }>(),
  { editable: false, canChangePhoto: false },
)

const emit = defineEmits<{
  save: [name: string]
  photo: [file: File]
  cover: [file: File]
}>()

const editing = ref(false)
const menuOpen = ref(false)
const draft = ref('')

function startEdit(): void {
  draft.value = props.name
  editing.value = true
  menuOpen.value = false
}

function save(): void {
  emit('save', draft.value)
  editing.value = false
}

function onPhoto(event: Event): void {
  const input = event.target
  if (!(input instanceof HTMLInputElement) || input.files === null || input.files.length === 0) {
    return
  }

  emit('photo', input.files[0])
  input.value = ''
}

function onCover(event: Event): void {
  const input = event.target
  if (!(input instanceof HTMLInputElement) || input.files === null || input.files.length === 0) {
    return
  }

  emit('cover', input.files[0])
  input.value = ''
}
</script>

<template>
  <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
    <div class="relative">
      <img v-if="cover" :src="cover" alt="" class="h-36 w-full object-cover sm:h-48" />
      <div v-else class="h-36 bg-brand sm:h-48"></div>
      <label
        v-if="canChangePhoto"
        class="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-white/95 px-3 py-2 text-sm font-medium text-ink shadow"
      >
        <AppIcon name="pencil" class="h-4 w-4" />
        Cambiar portada
        <input
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="onCover"
        />
      </label>
    </div>
    <div class="px-4 pb-4 sm:px-6">
      <div class="-mt-10 flex flex-col items-center text-center sm:mt-0 sm:flex-row sm:items-end sm:text-left">
        <div class="relative sm:-mt-12">
          <PersonMark :src="avatar" :label="name" class="h-24 w-24 rounded-full text-2xl ring-4 ring-white" />
          <label
            v-if="canChangePhoto"
            class="absolute bottom-0 right-0 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-brand text-white shadow"
          >
            <span class="sr-only">Cambiar foto de perfil</span>
            <AppIcon name="pencil" class="h-4 w-4" />
            <input
              type="file"
              class="sr-only"
              accept="image/jpeg,image/png,image/webp,image/gif"
              @change="onPhoto"
            />
          </label>
        </div>
        <div class="mt-3 min-w-0 sm:mb-1 sm:ml-4 sm:mt-4 sm:flex-1">
          <h1 class="flex items-center justify-center gap-1 text-xl font-semibold sm:justify-start">
            {{ name }}
            <span class="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] leading-none text-white" aria-hidden="true">✓</span>
          </h1>
          <p class="text-sm text-slate-500">{{ voices }} voces</p>
        </div>
        <div class="mt-3 flex items-center gap-2 sm:mb-2">
          <button v-if="editable" type="button" class="inline-flex items-center gap-2 rounded-md bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600" @click="startEdit">
            <AppIcon name="pencil" class="h-4 w-4" />
            Editar perfil
          </button>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600"
            aria-label="Más opciones de la cuenta"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon name="more" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <form v-if="editing" class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" @submit.prevent="save">
        <div class="flex-1 text-left">
          <label class="text-sm font-medium" for="nombre-visible">Nombre visible</label>
          <input
            id="nombre-visible"
            v-model="draft"
            type="text"
            maxlength="40"
            class="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <button type="submit" class="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white">Guardar</button>
        <button type="button" class="h-10 rounded-md border border-slate-200 px-4 text-sm" @click="editing = false">Cancelar</button>
      </form>

      <p v-if="menuOpen" class="mt-3 text-center sm:text-left">
        <RouterLink to="/ingresar" class="text-sm font-medium text-brand">Conectar este dispositivo</RouterLink>
      </p>

      <ul class="mt-4 space-y-1 text-sm text-slate-600 sm:flex sm:flex-wrap sm:gap-x-5 sm:space-y-0">
        <li class="inline-flex items-center justify-center gap-1 sm:justify-start">
          <AppIcon name="users" class="h-4 w-4 text-slate-400" />
          {{ role }}
        </li>
        <li class="inline-flex items-center justify-center gap-1 sm:justify-start">
          <AppIcon name="pin" class="h-4 w-4 text-slate-400" />
          {{ place }}
        </li>
        <li class="inline-flex items-center justify-center gap-1 sm:justify-start">
          <AppIcon name="calendar" class="h-4 w-4 text-slate-400" />
          <span v-if="joined">Se unió el {{ joined }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
