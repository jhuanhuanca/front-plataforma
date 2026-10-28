<script setup lang="ts">
import type { ProfileFriend } from '../../data/profile'
import AppIcon from '../ui/AppIcon.vue'

defineProps<{
  people: ProfileFriend[]
  following: string[]
}>()

const emit = defineEmits<{
  message: [nick: string]
  follow: [id: string]
}>()
</script>

<template>
  <ul class="grid grid-cols-2 gap-3">
    <li v-for="person in people" :key="person.id" class="rounded-xl border border-slate-200 p-3 text-center">
      <img :src="person.avatar" alt="" class="mx-auto h-16 w-16 rounded-full object-cover" />
      <p class="mt-2 text-sm font-semibold">{{ person.name }}</p>
      <p class="text-xs text-slate-500">{{ person.mutual }}</p>
      <div class="mt-3 flex justify-center gap-2">
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-md bg-brand text-white"
          :aria-label="`Mensaje para ${person.name}`"
          @click="emit('message', person.nick)"
        >
          <AppIcon name="message" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-md bg-rose-500 text-white"
          :aria-pressed="following.includes(person.id)"
          :aria-label="following.includes(person.id) ? `Dejar de seguir a ${person.name}` : `Seguir a ${person.name}`"
          @click="emit('follow', person.id)"
        >
          <AppIcon :name="following.includes(person.id) ? 'check' : 'plus'" class="h-4 w-4" />
        </button>
      </div>
    </li>
  </ul>
</template>
